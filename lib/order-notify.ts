import "server-only";
import { prisma } from "@/lib/prisma";
import { sendMail, ORDER_NOTIFICATION_EMAIL } from "@/lib/mail";

/*
  Order emails. Two audiences:
   - the operator (ORDER_NOTIFICATION_EMAIL) when a new order is paid, and
   - the customer: an order confirmation when paid, and a shipped note with
     tracking when it goes out.
  Called from the client verify path and the Razorpay webhook, so each is written
  to be safe to call more than once (idempotent content).
*/

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function loadOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true } } },
  });
}

function itemLines(items: { title: string; size: string | null; quantity: number; priceInr: number }[]): string {
  return items
    .map((i) => `  - ${i.title}${i.size ? ` [size ${i.size}]` : ""} x${i.quantity} (₹${i.priceInr} each)`)
    .join("\n");
}

/** New paid order: notify the operator AND send the customer a confirmation. */
export async function notifyOrderPlaced(orderId: string): Promise<void> {
  const order = await loadOrder(orderId);
  if (!order) return;
  const shortId = order.id.slice(-6).toUpperCase();

  // Operator notification
  const opText = [
    `New order from ${order.shipName} (${order.user?.email ?? "no email"}).`,
    "",
    "Items:",
    itemLines(order.items),
    "",
    `Total: ₹${order.totalInr}`,
    "",
    "Ship to:",
    `  ${order.shipName}, ${order.shipPhone}`,
    `  ${order.shipLine1}${order.shipLine2 ? ", " + order.shipLine2 : ""}`,
    `  ${order.shipCity}, ${order.shipState} ${order.shipPincode}`,
    "",
    `Order id: ${order.id}`,
  ].join("\n");
  await sendMail({
    to: ORDER_NOTIFICATION_EMAIL,
    subject: `New shop order #${shortId} from ${order.shipName} — ₹${order.totalInr}`,
    text: opText,
  });

  // Customer confirmation
  if (order.user?.email) {
    const custText = [
      `Hi ${order.shipName.split(" ")[0] || "there"},`,
      "",
      `Thanks for your order #${shortId} — it's confirmed and being packed.`,
      "",
      "Items:",
      itemLines(order.items),
      "",
      `Total paid: ₹${order.totalInr}`,
      "",
      "We'll email you a tracking link as soon as it ships. You can also see it under Shop → Orders in the app.",
      "",
      "— Break It Thru",
    ].join("\n");
    await sendMail({
      to: order.user.email,
      subject: `Your Break It Thru order #${shortId} is confirmed`,
      text: custText,
    });
  }
}

/** Order shipped: send the customer their tracking + ETA. */
export async function notifyOrderShipped(orderId: string): Promise<void> {
  const order = await loadOrder(orderId);
  if (!order || !order.user?.email) return;
  const shortId = order.id.slice(-6).toUpperCase();

  const text = [
    `Hi ${order.shipName.split(" ")[0] || "there"},`,
    "",
    `Good news — your order #${shortId} is on its way.`,
    "",
    order.etaAt ? `Estimated delivery: ${fmtDate(order.etaAt)}` : "",
    order.trackingCarrier ? `Courier: ${order.trackingCarrier}` : "",
    order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : "",
    order.trackingUrl ? `Track it: ${order.trackingUrl}` : "",
    "",
    "You can also track it under Shop → Orders in the app.",
    "",
    "— Break It Thru",
  ]
    .filter((l) => l !== "")
    .join("\n");

  await sendMail({
    to: order.user.email,
    subject: `Your Break It Thru order #${shortId} has shipped`,
    text,
  });
}
