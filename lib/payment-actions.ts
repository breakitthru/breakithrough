"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { createRazorpayOrder, verifyCheckoutSignature, isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { resolvePromo } from "@/lib/promo";

/*
  Razorpay checkout for the one-time program purchase.
    1. validatePromo  — checkout preview of a discount code (no side effects).
    2. createPaymentOrder — applies the promo (re-priced server-side), creates the
       Payment row + Razorpay order. A 100%-off code skips Razorpay and unlocks
       the plan directly.
    3. verifyPayment  — verifies the signature, marks PAID, unlocks the plan, and
       increments the promo's redemption count. The webhook is the backup.
*/

/** Checkout preview only — does not create anything. */
export async function validatePromo(code: string): Promise<{ ok: true; discountInr: number; finalInr: number } | { ok: false; error: string }> {
  await requireUser();
  const { programPriceInr } = await getConfig();
  const res = await resolvePromo(code, programPriceInr);
  if (!res.ok) return res;
  return { ok: true, discountInr: res.discountInr, finalInr: res.finalInr };
}

type OrderResult =
  | { ok: true; free: true }
  | { ok: true; free: false; orderId: string; amountPaise: number; keyId: string; email: string; prefillName: string }
  | { ok: false; error: string };

export async function createPaymentOrder(promoCode?: string): Promise<OrderResult> {
  const user = await requireUser();
  if (user.plan === "ACTIVE" || user.plan === "COMPLETED") {
    return { ok: false, error: "You already have full access." };
  }

  const config = await getConfig();
  let amountInr: number = config.programPriceInr;
  let appliedCode: string | null = null;

  if (promoCode && promoCode.trim()) {
    const promo = await resolvePromo(promoCode, config.programPriceInr);
    if (!promo.ok) return { ok: false, error: promo.error };
    amountInr = promo.finalInr;
    appliedCode = promo.code;
  }

  // Fully-discounted purchase — no payment gateway needed.
  if (amountInr <= 0) {
    await prisma.$transaction([
      prisma.payment.create({ data: { userId: user.id, amountInr: 0, status: "PAID", promoCode: appliedCode } }),
      prisma.user.updateMany({ where: { id: user.id, plan: { in: ["TRIAL", "EXPIRED"] } }, data: { plan: "ACTIVE", paidAt: new Date() } }),
    ]);
    if (appliedCode) await incrementPromo(appliedCode);
    revalidatePath("/today");
    return { ok: true, free: true };
  }

  if (!isRazorpayConfigured) {
    return { ok: false, error: "Payments aren't switched on yet. Please try again shortly." };
  }

  const payment = await prisma.payment.create({
    data: { userId: user.id, amountInr, status: "CREATED", promoCode: appliedCode },
  });

  try {
    const order = await createRazorpayOrder({
      amountPaise: amountInr * 100,
      receipt: payment.id,
      notes: { userId: user.id, paymentId: payment.id, ...(appliedCode ? { promoCode: appliedCode } : {}) },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { razorpayOrderId: order.id } });
    return {
      ok: true,
      free: false,
      orderId: order.id,
      amountPaise: amountInr * 100,
      keyId: razorpayKeyId,
      email: user.email ?? "",
      prefillName: user.displayName ?? user.name ?? "",
    };
  } catch (e) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return { ok: false, error: e instanceof Error ? e.message : "Could not start checkout" };
  }
}

export async function verifyPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!verifyCheckoutSignature(input.orderId, input.paymentId, input.signature)) {
    return { ok: false, error: "We couldn't verify that payment. If money was deducted it will be confirmed shortly." };
  }
  const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: input.orderId, userId: user.id } });
  if (!payment) return { ok: false, error: "Order not found." };
  const alreadyPaid = payment.status === "PAID";

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID", razorpayPaymentId: input.paymentId } }),
    prisma.user.updateMany({
      where: { id: user.id, plan: { in: ["TRIAL", "EXPIRED"] } },
      data: { plan: "ACTIVE", paidAt: new Date() },
    }),
  ]);
  if (!alreadyPaid && payment.promoCode) await incrementPromo(payment.promoCode);
  revalidatePath("/today");
  return { ok: true };
}

async function incrementPromo(code: string): Promise<void> {
  await prisma.promoCode.updateMany({ where: { code }, data: { redeemedCount: { increment: 1 } } });
}
