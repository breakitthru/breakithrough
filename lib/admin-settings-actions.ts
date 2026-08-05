"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

/** Set any settings-scoped SiteConfig value. */
export async function setSettingsConfig(key: string, value: unknown): Promise<Result> {
  const admin = await requirePermission("settings.edit");
  await prisma.siteConfig.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "config.set", targetType: "SiteConfig", targetId: key, summary: `Set ${key}`, meta: { value: value as never } });
  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/notifications");
  return { ok: true };
}

const policySchema = z.object({
  key: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1),
});
export type PolicyInput = { key: string; title: string; body: string };

/** Create or update a policy; bumps the version and sets liveSince when saved. */
export async function savePolicy(input: PolicyInput): Promise<Result> {
  const admin = await requirePermission("settings.edit");
  const parsed = policySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid policy" };
  const existing = await prisma.policy.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    await prisma.policy.update({
      where: { key: parsed.data.key },
      data: { title: parsed.data.title, body: parsed.data.body, version: existing.version + 1, liveSince: new Date() },
    });
  } else {
    await prisma.policy.create({
      data: { key: parsed.data.key, title: parsed.data.title, body: parsed.data.body, version: 1, liveSince: new Date() },
    });
  }
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "policy.save", targetType: "Policy", targetId: parsed.data.key, summary: `Published ${parsed.data.title}` });
  revalidatePath("/admin/settings/legal");
  return { ok: true };
}

export async function deletePolicy(key: string): Promise<Result> {
  const admin = await requirePermission("settings.edit");
  const p = await prisma.policy.findUnique({ where: { key } });
  if (!p) return { ok: false, error: "Policy not found" };
  await prisma.policy.delete({ where: { key } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "policy.delete", targetType: "Policy", targetId: key, summary: `Deleted ${p.title}` });
  revalidatePath("/admin/settings/legal");
  return { ok: true };
}
