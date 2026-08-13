"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, dashes or underscores"),
  discountType: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().int().min(1).max(1_000_000),
  active: z.coerce.boolean(),
  maxRedemptions: z.union([z.coerce.number().int().min(1).max(1_000_000), z.null()]).optional(),
  expiresAt: z.string().optional().nullable(),
});

export type PromoInput = {
  code: string;
  discountType: string;
  value: number | string;
  active: boolean;
  maxRedemptions?: number | string | null;
  expiresAt?: string | null;
};

function parseExpiry(v: string | null | undefined): Date | null | "invalid" {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? "invalid" : d;
}

export async function createPromo(input: PromoInput): Promise<Result> {
  const admin = await requirePermission("money.act");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid promo code" };
  if (parsed.data.discountType === "PERCENT" && parsed.data.value > 100) return { ok: false, error: "A percentage can't exceed 100." };
  const expiresAt = parseExpiry(parsed.data.expiresAt);
  if (expiresAt === "invalid") return { ok: false, error: "That expiry date isn't valid." };

  const code = parsed.data.code.toUpperCase();
  const exists = await prisma.promoCode.findUnique({ where: { code } });
  if (exists) return { ok: false, error: "A code with that name already exists." };

  const p = await prisma.promoCode.create({
    data: {
      code,
      discountType: parsed.data.discountType,
      value: parsed.data.value,
      active: parsed.data.active,
      maxRedemptions: parsed.data.maxRedemptions == null ? null : Number(parsed.data.maxRedemptions),
      expiresAt,
    },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "promo.create", targetType: "PromoCode", targetId: p.id, summary: `Created promo ${code}` });
  revalidatePath("/admin/money/promos");
  return { ok: true };
}

export async function updatePromo(id: string, input: PromoInput): Promise<Result> {
  const admin = await requirePermission("money.act");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid promo code" };
  if (parsed.data.discountType === "PERCENT" && parsed.data.value > 100) return { ok: false, error: "A percentage can't exceed 100." };
  const expiresAt = parseExpiry(parsed.data.expiresAt);
  if (expiresAt === "invalid") return { ok: false, error: "That expiry date isn't valid." };

  const code = parsed.data.code.toUpperCase();
  const clash = await prisma.promoCode.findFirst({ where: { code, NOT: { id } } });
  if (clash) return { ok: false, error: "A code with that name already exists." };

  await prisma.promoCode.update({
    where: { id },
    data: {
      code,
      discountType: parsed.data.discountType,
      value: parsed.data.value,
      active: parsed.data.active,
      maxRedemptions: parsed.data.maxRedemptions == null ? null : Number(parsed.data.maxRedemptions),
      expiresAt,
    },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "promo.update", targetType: "PromoCode", targetId: id, summary: `Edited promo ${code}` });
  revalidatePath("/admin/money/promos");
  return { ok: true };
}

export async function deletePromo(id: string): Promise<Result> {
  const admin = await requirePermission("money.act");
  const p = await prisma.promoCode.findUnique({ where: { id } });
  if (!p) return { ok: false, error: "Promo not found" };
  await prisma.promoCode.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "promo.delete", targetType: "PromoCode", targetId: id, summary: `Deleted promo ${p.code}` });
  revalidatePath("/admin/money/promos");
  return { ok: true };
}
