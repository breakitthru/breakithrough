"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createRazorpayOrder, verifyCheckoutSignature, isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";
import { notifyOrderPlaced } from "@/lib/order-notify";

/*
  Shop checkout (money items, paid via Razorpay). Prices are always taken from the
  database, never from the client cart. On successful payment we snapshot the line
  items onto the Order, decrement stock, and email the order to the notification
  address. The admin sees a permanent (non-deletable) record under Shop → Orders.
*/

const addressSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(4, "Phone is required").max(20),
  line1: z.string().trim().min(1, "Address is required").max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  city: z.string().trim().min(1, "City is required").max(80),
  state: z.string().trim().min(1, "State is required").max(80),
  pincode: z.string().trim().min(4, "PIN code is required").max(12),
});
const itemsSchema = z.array(z.object({ shopItemId: z.string().min(1), quantity: z.coerce.number().int().min(1).max(20) })).min(1, "Your cart is empty");

export type ShopAddress = z.input<typeof addressSchema>;
export type CartLine = { shopItemId: string; quantity: number };

type OrderResult =
  | { ok: true; orderId: string; amountPaise: number; keyId: string; email: string; prefillName: string }
  | { ok: false; error: string };

export async function createShopOrder(input: { items: CartLine[]; address: ShopAddress }): Promise<OrderResult> {
  const user = await requireUser();
  const address = addressSchema.safeParse(input.address);
  if (!address.success) return { ok: false, error: address.error.issues[0]?.message ?? "Invalid address" };
  const items = itemsSchema.safeParse(input.items);
  if (!items.success) return { ok: false, error: items.error.issues[0]?.message ?? "Invalid cart" };
  if (!isRazorpayConfigured) return { ok: false, error: "Payments aren't switched on yet. Please try again shortly." };

  // Resolve prices + availability from the DB.
  const ids = items.data.map((i) => i.shopItemId);
  const products = await prisma.shopItem.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: { shopItemId: string; title: string; priceInr: number; quantity: number }[] = [];
  for (const line of items.data) {
    const p = byId.get(line.shopItemId);
    if (!p) return { ok: false, error: "One of the items is no longer available." };
    if (p.stock !== null && p.stock < line.quantity) return { ok: false, error: `"${p.title}" is out of stock.` };
    lines.push({ shopItemId: p.id, title: p.title, priceInr: p.priceInr, quantity: line.quantity });
  }
  const totalInr = lines.reduce((sum, l) => sum + l.priceInr * l.quantity, 0);
  if (totalInr <= 0) return { ok: false, error: "Nothing to pay for." };

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      totalInr,
      shipName: address.data.name,
      shipPhone: address.data.phone,
      shipLine1: address.data.line1,
      shipLine2: address.data.line2 || null,
      shipCity: address.data.city,
      shipState: address.data.state,
      shipPincode: address.data.pincode,
      items: { create: lines },
    },
  });

  try {
    const rzp = await createRazorpayOrder({ amountPaise: totalInr * 100, receipt: order.id, notes: { userId: user.id, orderId: order.id, kind: "shop" } });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return {
      ok: true,
      orderId: rzp.id,
      amountPaise: totalInr * 100,
      keyId: razorpayKeyId,
      email: user.email ?? "",
      prefillName: address.data.name,
    };
  } catch (e) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return { ok: false, error: e instanceof Error ? e.message : "Could not start checkout" };
  }
}

export async function verifyShopPayment(input: { orderId: string; paymentId: string; signature: string }): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!verifyCheckoutSignature(input.orderId, input.paymentId, input.signature)) {
    return { ok: false, error: "We couldn't verify that payment. If money was deducted it will be confirmed shortly." };
  }
  const order = await prisma.order.findFirst({ where: { razorpayOrderId: input.orderId, userId: user.id }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status === "PAID" || order.status === "FULFILLED") return { ok: true };

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "PAID", razorpayPaymentId: input.paymentId } }),
    ...order.items
      .filter((i) => i.shopItemId)
      .map((i) => prisma.shopItem.updateMany({ where: { id: i.shopItemId!, stock: { not: null } }, data: { stock: { decrement: i.quantity } } })),
  ]);

  await notifyOrderPlaced(order.id);
  return { ok: true };
}
