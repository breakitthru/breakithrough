"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

export async function markSosReviewed(id: string): Promise<Result> {
  const admin = await requirePermission("safety.act");
  await prisma.sosEvent.update({ where: { id }, data: { reviewedAt: new Date(), reviewedById: admin.id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "sos.review", targetType: "SosEvent", targetId: id, summary: "Marked an SOS event reviewed" });
  revalidatePath("/admin/safety");
  revalidatePath(`/admin/safety/event/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

const helplineSchema = z.object({
  name: z.string().trim().min(1, "A name is required").max(120),
  phone: z.string().trim().min(1, "A phone number is required").max(40),
  hours: z.string().trim().max(60).optional().nullable(),
  languages: z.string().trim().max(120).optional().nullable(),
  active: z.coerce.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
});

export type HelplineInput = {
  name: string;
  phone: string;
  hours?: string | null;
  languages?: string | null;
  active: boolean;
  order: number | string;
};

export async function createHelpline(input: HelplineInput): Promise<Result> {
  const admin = await requirePermission("safety.act");
  const parsed = helplineSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid helpline" };
  const h = await prisma.helpline.create({ data: { ...parsed.data, hours: parsed.data.hours || null, languages: parsed.data.languages || null } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "helpline.create", targetType: "Helpline", targetId: h.id, summary: `Added helpline "${parsed.data.name}"` });
  revalidatePath("/admin/safety/on-call");
  revalidatePath("/sos");
  return { ok: true };
}

export async function updateHelpline(id: string, input: HelplineInput): Promise<Result> {
  const admin = await requirePermission("safety.act");
  const parsed = helplineSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid helpline" };
  await prisma.helpline.update({ where: { id }, data: { ...parsed.data, hours: parsed.data.hours || null, languages: parsed.data.languages || null } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "helpline.update", targetType: "Helpline", targetId: id, summary: `Edited helpline "${parsed.data.name}"` });
  revalidatePath("/admin/safety/on-call");
  revalidatePath("/sos");
  return { ok: true };
}

export async function deleteHelpline(id: string): Promise<Result> {
  const admin = await requirePermission("safety.act");
  const h = await prisma.helpline.findUnique({ where: { id } });
  if (!h) return { ok: false, error: "Helpline not found" };
  await prisma.helpline.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "helpline.delete", targetType: "Helpline", targetId: id, summary: `Deleted helpline "${h.name}"` });
  revalidatePath("/admin/safety/on-call");
  revalidatePath("/sos");
  return { ok: true };
}

/** On-call rota is stored as free JSON in SiteConfig for now (no auto-firing worker). */
export async function setOnCallRota(value: unknown): Promise<Result> {
  const admin = await requirePermission("safety.act");
  await prisma.siteConfig.upsert({ where: { key: "onCallRota" }, update: { value: value as never }, create: { key: "onCallRota", value: value as never } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "config.set", targetType: "SiteConfig", targetId: "onCallRota", summary: "Updated the on-call rota" });
  revalidatePath("/admin/safety/on-call");
  return { ok: true };
}
