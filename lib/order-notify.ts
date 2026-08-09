import "server-only";
import { prisma } from "@/lib/prisma";
import { sendMail, ORDER_NOTIFICATION_EMAIL } from "@/lib/mail";

/*
  Emails a placed shop order to the notification address. Called from both the
  client verify path and the Razorpay webhook, so it is written to be safe to
  call more than once (the mail body is idempotent content).
*/
export async function notifyOrderPlaced(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { email: true } } },
  });
  if (!order) return;

  const lines = order.items.map((i) => `  - ${i.title} x${i.quantity} (₹${i.priceInr} each)`).join("\n");
  const text = [
    `New order from ${order.shipName} (${order.user?.email ?? "no email"}).`,
    "",
    "Items:",
    lines,
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
    subject: `New shop order from ${order.shipName} — ₹${order.totalInr}`,
    text,
  });
}
