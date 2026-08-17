import "server-only";
import { env } from "@/lib/env";

/*
  Minimal AI chat client for Daylight. OpenAI-compatible Chat Completions over
  fetch (no SDK dependency). The key + model can be set two ways, DB wins:
    1. Admin panel  → stored in SiteConfig (keys "aiApiKey" / "aiModel").
    2. Environment  → AI_API_KEY / AI_MODEL (fallback, and for local dev).
  The key is a secret: it is read server-side only and never merged into the
  app config that reaches client components (see getConfig() in lib/config.ts).
*/

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

/** Resolve the effective AI key + model. An admin-set SiteConfig value overrides env. */
export async function getAiSettings(): Promise<{ apiKey: string; model: string }> {
  let apiKey = (env.AI_API_KEY ?? "").trim();
  let model = (env.AI_MODEL ?? "gpt-4o-mini").trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.siteConfig.findMany({ where: { key: { in: ["aiApiKey", "aiModel"] } } });
    for (const r of rows) {
      if (r.key === "aiApiKey" && typeof r.value === "string" && r.value.trim()) apiKey = r.value.trim();
      if (r.key === "aiModel" && typeof r.value === "string" && r.value.trim()) model = r.value.trim();
    }
  } catch {
    // DB unreachable — fall back to env.
  }
  return { apiKey, model };
}

/** Whether Daylight has a usable key (admin-set or env). */
export async function isAiConfigured(): Promise<boolean> {
  const { apiKey } = await getAiSettings();
  return Boolean(apiKey);
}

/** Send a chat conversation and return the assistant's reply text. */
export async function chatComplete(messages: ChatTurn[]): Promise<string> {
  const { apiKey, model } = await getAiSettings();
  if (!apiKey) throw new Error("The AI companion isn't configured yet.");
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 600,
      temperature: 0.8,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message ?? "The AI companion is unavailable right now.");
  }
  const reply = json?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("The AI companion didn't return a response. Please try again.");
  }
  return reply.trim();
}
