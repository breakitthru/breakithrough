import "server-only";
import { prisma } from "@/lib/prisma";

/*
  Promo code resolution for the one-time program purchase. Always re-priced from
  the database — the client never dictates the discount. Returns the discount and
  the final price so both the checkout preview and the order creation agree.
*/

export type PromoResolved =
  | { ok: true; code: string; discountInr: number; finalInr: number }
  | { ok: false; error: string };

export async function resolvePromo(rawCode: string, priceInr: number): Promise<PromoResolved> {
  const code = (rawCode ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return { ok: false, error: "That code isn't valid." };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { ok: false, error: "That code has expired." };
  if (promo.maxRedemptions !== null && promo.redeemedCount >= promo.maxRedemptions) {
    return { ok: false, error: "That code has been fully redeemed." };
  }

  const raw = promo.discountType === "PERCENT" ? Math.round((priceInr * promo.value) / 100) : promo.value;
  const discountInr = Math.max(0, Math.min(raw, priceInr));
  return { ok: true, code, discountInr, finalInr: priceInr - discountInr };
}
