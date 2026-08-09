"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { createRazorpayOrder, verifyCheckoutSignature, isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

/*
  Real Razorpay checkout flow (replaces the old completePaymentStub):
    1. createPaymentOrder — creates our Payment row + a Razorpay order, returns
       the details the browser needs to open Checkout.
    2. verifyPayment — verifies the signature Checkout returns, then marks the
       Payment PAID and unlocks the plan. The webhook is the backup source of
       truth in case the browser closes before this runs.
*/

type OrderResult =
  | { ok: true; orderId: string; amountPaise: number; keyId: string; email: string; prefillName: string }
  | { ok: false; error: string };

export async function createPaymentOrder(): Promise<OrderResult> {
  const user = await requireUser();
  if (user.plan === "ACTIVE" || user.plan === "COMPLETED") {
    return { ok: false, error: "You already have full access." };
  }
  if (!isRazorpayConfigured) {
    return { ok: false, error: "Payments aren't switched on yet. Please try again shortly." };
  }

  const config = await getConfig();
  const amountPaise = config.programPriceInr * 100;

  // Our Payment row is created first so the Razorpay receipt links order to user.
  const payment = await prisma.payment.create({
    data: { userId: user.id, amountInr: config.programPriceInr, status: "CREATED" },
  });

  try {
    const order = await createRazorpayOrder({
      amountPaise,
      receipt: payment.id,
      notes: { userId: user.id, paymentId: payment.id },
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { razorpayOrderId: order.id } });
    return {
      ok: true,
      orderId: order.id,
      amountPaise,
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

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID", razorpayPaymentId: input.paymentId } }),
    // updateMany with a guard so a COMPLETED plan is never downgraded to ACTIVE.
    prisma.user.updateMany({
      where: { id: user.id, plan: { in: ["TRIAL", "EXPIRED"] } },
      data: { plan: "ACTIVE", paidAt: new Date() },
    }),
  ]);
  revalidatePath("/today");
  return { ok: true };
}
