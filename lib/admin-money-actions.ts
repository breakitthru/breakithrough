"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

/** Refund a payment. STUB: flips status to REFUNDED; real Razorpay refund is not wired. */
export async function refundPayment(id: string): Promise<Result> {
  const admin = await requirePermission("money.act");
  const p = await prisma.payment.findUnique({ where: { id } });
  if (!p) return { ok: false, error: "Payment not found" };
  if (p.status !== "PAID") return { ok: false, error: "Only paid payments can be refunded" };
  await prisma.payment.update({ where: { id }, data: { status: "REFUNDED" } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "payment.refund", targetType: "Payment", targetId: id, summary: `Refunded ₹${p.amountInr} (stub)` });
  revalidatePath("/admin/money");
  revalidatePath(`/admin/members/${p.userId}`);
  return { ok: true };
}

/** Set a money-related SiteConfig value (e.g. rupeePerPoint). */
export async function setMoneyConfig(key: string, value: unknown): Promise<Result> {
  const admin = await requirePermission("money.act");
  await prisma.siteConfig.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "config.set", targetType: "SiteConfig", targetId: key, summary: `Set ${key}`, meta: { value: value as never } });
  revalidatePath("/admin/money/points");
  revalidatePath("/progress/rewards");
  return { ok: true };
}

// ── Rewards ─────────────────────────────────────────────────────────

const KINDS = ["DIGITAL", "DISCOUNT", "PHYSICAL"] as const;
const rewardSchema = z.object({
  key: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(240).optional().nullable(),
  pointsCost: z.coerce.number().int().min(0).max(100000),
  kind: z.enum(KINDS),
  featured: z.coerce.boolean(),
  active: z.coerce.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
});
export type RewardInput = {
  key: string;
  title: string;
  description?: string | null;
  pointsCost: number | string;
  kind: string;
  featured: boolean;
  active: boolean;
  order: number | string;
};

export async function createReward(input: RewardInput): Promise<Result> {
  const admin = await requirePermission("rewards.act");
  const parsed = rewardSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reward" };
  const exists = await prisma.reward.findUnique({ where: { key: parsed.data.key } });
  if (exists) return { ok: false, error: "A reward with that key already exists" };
  const r = await prisma.reward.create({ data: { ...parsed.data, description: parsed.data.description || null } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "reward.create", targetType: "Reward", targetId: r.id, summary: `Added reward "${parsed.data.title}"` });
  revalidatePath("/admin/money/rewards");
  revalidatePath("/progress/rewards");
  return { ok: true };
}

export async function updateReward(id: string, input: RewardInput): Promise<Result> {
  const admin = await requirePermission("rewards.act");
  const parsed = rewardSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid reward" };
  await prisma.reward.update({ where: { id }, data: { ...parsed.data, description: parsed.data.description || null } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "reward.update", targetType: "Reward", targetId: id, summary: `Edited reward "${parsed.data.title}"` });
  revalidatePath("/admin/money/rewards");
  revalidatePath("/progress/rewards");
  return { ok: true };
}

export async function deleteReward(id: string): Promise<Result> {
  const admin = await requirePermission("rewards.act");
  const r = await prisma.reward.findUnique({ where: { id } });
  if (!r) return { ok: false, error: "Reward not found" };
  await prisma.reward.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "reward.delete", targetType: "Reward", targetId: id, summary: `Deleted reward "${r.title}"` });
  revalidatePath("/admin/money/rewards");
  revalidatePath("/progress/rewards");
  return { ok: true };
}

export async function setRedemptionStatus(id: string, status: "FULFILLED" | "CANCELLED"): Promise<Result> {
  const admin = await requirePermission("rewards.act");
  await prisma.redemption.update({ where: { id }, data: { status } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "redemption.status", targetType: "Redemption", targetId: id, summary: `Marked a redemption ${status.toLowerCase()}` });
  revalidatePath("/admin/money/rewards");
  return { ok: true };
}
