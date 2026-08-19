import "server-only";
import { prisma } from "@/lib/prisma";
import { sizeStockMap } from "@/lib/shop-inventory";
import { notifyOrderPlaced } from "@/lib/order-notify";

/*
  Marks a shop order paid exactly once and decrements stock. Called from both the
  client verify path and the Razorpay webhook. The PAID transition is claimed with
  a conditional update so concurrent deliveries can't double-decrement stock.
*/
export async function confirmOrderPaid(orderId: string, paymentId: string | null): Promise<void> {
  // Single-winner claim: only the delivery that flips PENDING -> PAID proceeds.
  const claim = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PAID", razorpayPaymentId: paymentId ?? undefined },
  });
  if (claim.count === 0) return; // already processed (or never pending)

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;

  await prisma.$transaction(async (tx) => {
    for (const line of order.items) {
      if (!line.shopItemId) continue;
      const product = await tx.shopItem.findUnique({ where: { id: line.shopItemId } });
      if (!product) continue;
      if (product.hasSizes) {
        const map = sizeStockMap(product);
        if (map && line.size && line.size in map) {
          map[line.size] = Math.max(0, map[line.size] - line.quantity);
          await tx.shopItem.update({ where: { id: product.id }, data: { sizeStock: map } });
        }
      } else if (product.stock !== null) {
        await tx.shopItem.update({ where: { id: product.id }, data: { stock: Math.max(0, product.stock - line.quantity) } });
      }
    }
  });

  await notifyOrderPlaced(order.id);
}

/** Restock a cancelled order's items (reverses confirmOrderPaid's decrement). */
export async function restockOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;
  await prisma.$transaction(async (tx) => {
    for (const line of order.items) {
      if (!line.shopItemId) continue;
      const product = await tx.shopItem.findUnique({ where: { id: line.shopItemId } });
      if (!product) continue;
      if (product.hasSizes) {
        const map = sizeStockMap(product);
        if (map && line.size && line.size in map) {
          map[line.size] = map[line.size] + line.quantity;
          await tx.shopItem.update({ where: { id: product.id }, data: { sizeStock: map } });
        }
      } else if (product.stock !== null) {
        await tx.shopItem.update({ where: { id: product.id }, data: { stock: product.stock + line.quantity } });
      }
    }
  });
}
