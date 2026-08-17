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

/**
 * Set (or clear) the Daylight AI key. Stored in SiteConfig ("aiApiKey"); read
 * only server-side via getAiSettings(). Pass an empty string to remove it and
 * fall back to the environment variable. The key value is never written to the
 * audit log — only the fact that it changed.
 */
export async function setAiApiKey(rawKey: string): Promise<Result> {
  const admin = await requirePermission("settings.edit");
  const key = (rawKey ?? "").trim();
  if (key && !/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) {
    return { ok: false, error: "That doesn't look like an OpenAI key. It should start with \"sk-\"." };
  }
  await prisma.siteConfig.upsert({
    where: { key: "aiApiKey" },
    update: { value: key as never },
    create: { key: "aiApiKey", value: key as never },
  });
  await logAudit({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "config.set",
    targetType: "SiteConfig",
    targetId: "aiApiKey",
    summary: key ? "Updated the Daylight AI key" : "Removed the Daylight AI key",
  });
  revalidatePath("/admin/daylight");
  return { ok: true };
}

const LOGO_DATA_URL = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

/**
 * Save (or clear) the brand logo + its size. The logo is stored as a data URL in
 * SiteConfig so no external image host is needed. Pass dataUrl=null to remove it
 * and fall back to the placeholder box everywhere.
 */
export async function setBrandLogo(dataUrl: string | null, size: number): Promise<Result> {
  const admin = await requirePermission("settings.edit");
  const clampedSize = Math.max(16, Math.min(120, Math.round(Number(size) || 40)));
  if (dataUrl) {
    if (!LOGO_DATA_URL.test(dataUrl)) return { ok: false, error: "That doesn't look like a supported image (PNG, JPG, WEBP, GIF or SVG)." };
    if (dataUrl.length > 900_000) return { ok: false, error: "That image is too large. Please keep it under about 600 KB." };
  }
  await prisma.$transaction([
    prisma.siteConfig.upsert({ where: { key: "logoUrl" }, update: { value: (dataUrl ?? "") as never }, create: { key: "logoUrl", value: (dataUrl ?? "") as never } }),
    prisma.siteConfig.upsert({ where: { key: "logoSize" }, update: { value: clampedSize as never }, create: { key: "logoSize", value: clampedSize as never } }),
  ]);
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "brand.logo", targetType: "SiteConfig", targetId: "logoUrl", summary: dataUrl ? `Updated the brand logo (height ${clampedSize}px)` : "Removed the brand logo" });
  // The logo appears in every shell, so refresh everything under the root layout.
  revalidatePath("/", "layout");
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
