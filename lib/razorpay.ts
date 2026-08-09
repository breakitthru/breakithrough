import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

/*
  Razorpay helpers (fetch + node:crypto, no SDK dependency). Order creation and
  refunds use HTTP Basic auth with the key id + secret. Signature checks use the
  documented HMAC-SHA256 schemes: order_id|payment_id for the browser handler,
  and the raw request body for webhooks.
*/

const API = "https://api.razorpay.com/v1";

export const isRazorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

/** The publishable key id — safe to hand to the browser checkout. */
export const razorpayKeyId = env.RAZORPAY_KEY_ID;

function authHeader() {
  const basic = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${basic}`;
}

export type RzpOrder = { id: string; amount: number; currency: string };

export async function createRazorpayOrder(opts: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RzpOrder> {
  if (!isRazorpayConfigured) throw new Error("Razorpay is not configured");
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: opts.amountPaise, currency: "INR", receipt: opts.receipt, notes: opts.notes ?? {} }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.id) throw new Error(json?.error?.description ?? "Could not create the order");
  return { id: json.id as string, amount: json.amount as number, currency: json.currency as string };
}

/** Verify the signature Razorpay Checkout hands back to the browser handler. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

/** Verify a webhook body against the X-Razorpay-Signature header. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

export async function refundRazorpayPayment(paymentId: string, amountPaise?: number): Promise<void> {
  if (!isRazorpayConfigured) throw new Error("Razorpay is not configured");
  const res = await fetch(`${API}/payments/${paymentId}/refunds`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(amountPaise ? { amount: amountPaise } : {}),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error?.description ?? "Refund failed at Razorpay");
  }
}

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length || ba.length === 0) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
