"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

/*
  Send in-app notifications to members. This is fully self-contained — it writes
  Notification rows that the member /notifications page already renders. No email
  or push provider is involved; delivery is in-app only.
*/

type Result = { ok: true; count: number } | { ok: false; error: string };

const TYPES = ["system", "reminder", "reward", "badge"] as const;
const AUDIENCES = ["all", "active", "single"] as const;

const schema = z.object({
  audience: z.enum(AUDIENCES),
  email: z.string().trim().email().optional().or(z.literal("")),
  type: z.enum(TYPES),
  title: z.string().trim().min(1, "Add a title").max(120),
  body: z.string().trim().max(500).optional().nullable(),
  actionUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .refine((v) => !v || v.startsWith("/"), "Link must be an in-app path starting with /"),
});

export type NotifyInput = {
  audience: string;
  email?: string;
  type: string;
  title: string;
  body?: string | null;
  actionUrl?: string | null;
};

export async function sendNotification(input: NotifyInput): Promise<Result> {
  const admin = await requirePermission("notify.send");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid message" };
  const { audience, email, type, title } = parsed.data;
  const body = parsed.data.body?.trim() || null;
  const actionUrl = parsed.data.actionUrl?.trim() || null;

  // Resolve recipients. Members only (never staff-only rows), never deleted accounts.
  let recipients: { id: string }[];
  if (audience === "single") {
    if (!email) return { ok: false, error: "Enter the member's email" };
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, deletedAt: true } });
    if (!user || user.deletedAt) return { ok: false, error: "No active member with that email" };
    recipients = [{ id: user.id }];
  } else {
    recipients = await prisma.user.findMany({
      where: {
        role: "USER",
        deletedAt: null,
        // "active" = has actually started the program.
        ...(audience === "active" ? { programStartDate: { not: null } } : {}),
      },
      select: { id: true },
    });
  }

  if (recipients.length === 0) return { ok: false, error: "No members match that audience" };

  await prisma.notification.createMany({
    data: recipients.map((r) => ({ userId: r.id, type, title, body, actionUrl })),
  });

  const audienceLabel = audience === "single" ? email : audience === "active" ? "active members" : "all members";
  await logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "notification.send",
    targetType: "Notification",
    summary: `Sent "${title}" to ${audienceLabel} (${recipients.length})`,
    meta: { audience, type, count: recipients.length },
  });

  revalidatePath("/admin/announcements");
  return { ok: true, count: recipients.length };
}
