"use server";

import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { chatComplete, isAiConfigured, type ChatTurn } from "@/lib/ai";

/*
  Daylight chat. A member message is persisted, recent history is loaded, the
  admin-editable system prompt is prepended, and the AI reply is persisted and
  returned. Chat content is private to the member (never surfaced in admin) — the
  privacy wall in the data export already excludes ChatMessage bodies.
*/

const HISTORY_LIMIT = 20;

type SendResult = { ok: true; reply: string } | { ok: false; error: string };

export async function sendDaylightMessage(text: string): Promise<SendResult> {
  const user = await requireOnboardedUser();
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { ok: false, error: "Say something first." };
  if (trimmed.length > 4000) return { ok: false, error: "That message is a little long — try shortening it." };
  if (!(await isAiConfigured())) return { ok: false, error: "Daylight isn't switched on yet. Please try again later." };

  // Persist the member's message first so it survives even if the AI call fails.
  await prisma.chatMessage.create({ data: { userId: user.id, role: "USER", content: trimmed } });

  const recent = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { role: true, content: true },
  });
  recent.reverse();

  const { daylightSystemPrompt } = await getConfig();
  const messages: ChatTurn[] = [
    { role: "system", content: daylightSystemPrompt },
    ...recent.map((m) => ({ role: m.role === "USER" ? ("user" as const) : ("assistant" as const), content: m.content })),
  ];

  try {
    const reply = await chatComplete(messages);
    await prisma.chatMessage.create({ data: { userId: user.id, role: "ASSISTANT", content: reply } });
    return { ok: true, reply };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Daylight is unavailable right now." };
  }
}
