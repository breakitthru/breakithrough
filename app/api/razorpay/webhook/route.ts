import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { notifyOrderPlaced } from "@/lib/order-notify";

/*
  Razorpay webhook. The reliable source of truth for payment state: it fires even
  if the member closes the browser before the client handler runs. Configure it in
  the Razorpay dashboard (Settings, Webhooks) to POST here with events
  payment.captured and payment.failed, signed with RAZORPAY_WEBHOOK_SECRET.
  Everything here is idempotent, so duplicate deliveries are safe.
*/

export const dynamic = "force-dynamic";

type RazorpayWebhook = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: RazorpayWebhook;
  try {
    event = JSON.parse(raw) as RazorpayWebhook;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;
  if (!orderId) return NextResponse.json({ ok: true }); // not a payment event we track

  // Program access payment (Payment table)
  const payment = await prisma.payment.findFirst({ where: { razorpayOrderId: orderId } });
  if (payment) {
    if (event.event === "payment.captured" && payment.status !== "PAID") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", razorpayPaymentId: paymentId ?? payment.razorpayPaymentId },
        }),
        prisma.user.updateMany({
          where: { id: payment.userId, plan: { in: ["TRIAL", "EXPIRED"] } },
          data: { plan: "ACTIVE", paidAt: new Date() },
        }),
      ]);
    } else if (event.event === "payment.failed" && payment.status === "CREATED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", razorpayPaymentId: paymentId ?? payment.razorpayPaymentId },
      });
    }
    return NextResponse.json({ ok: true });
  }

  // Shop order (Order table)
  const order = await prisma.order.findFirst({ where: { razorpayOrderId: orderId }, include: { items: true } });
  if (order) {
    if (event.event === "payment.captured" && order.status !== "PAID" && order.status !== "FULFILLED") {
      await prisma.$transaction([
        prisma.order.update({ where: { id: order.id }, data: { status: "PAID", razorpayPaymentId: paymentId ?? order.razorpayPaymentId } }),
        ...order.items
          .filter((i) => i.shopItemId)
          .map((i) => prisma.shopItem.updateMany({ where: { id: i.shopItemId!, stock: { not: null } }, data: { stock: { decrement: i.quantity } } })),
      ]);
      await notifyOrderPlaced(order.id);
    } else if (event.event === "payment.failed" && order.status === "PENDING") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED", razorpayPaymentId: paymentId ?? order.razorpayPaymentId } });
    }
  }

  return NextResponse.json({ ok: true });
}
