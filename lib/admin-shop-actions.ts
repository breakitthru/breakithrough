"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { refundRazorpayPayment, isRazorpayConfigured } from "@/lib/razorpay";
import { restockOrder } from "@/lib/shop-fulfilment";
import { notifyOrderShipped } from "@/lib/order-notify";

type Result = { ok: true } | { ok: false; error: string };

const IMAGE_DATA_URL = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const itemSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(160),
  description: z.string().trim().max(600).optional().nullable(),
  priceInr: z.coerce.number().int().min(0).max(1_000_000),
  imageUrl: z.string().optional().nullable(),
  hasSizes: z.coerce.boolean(),
  sizes: z.array(z.string().trim().min(1).max(40)).max(30).optional().default([]),
  sizeChartUrl: z.string().optional().nullable(),
  sizeStock: z.record(z.string(), z.coerce.number().int().min(0).max(1_000_000)).nullable().optional(),
  stock: z.union([z.coerce.number().int().min(0).max(1_000_000), z.null()]).optional(),
  active: z.coerce.boolean(),
  featured: z.coerce.boolean(),
  order: z.coerce.number().int().min(0).max(1000),
});

export type ShopItemInput = {
  title: string;
  description?: string | null;
  priceInr: number | string;
  imageUrl?: string | null;
  hasSizes: boolean;
  sizes?: string[];
  sizeChartUrl?: string | null;
  sizeStock?: Record<string, number> | null;
  stock?: number | string | null;
  active: boolean;
  featured: boolean;
  order: number | string;
};

function validateImage(url: string | null | undefined): string | null | "invalid" {
  if (!url) return null;
  if (!IMAGE_DATA_URL.test(url)) return "invalid";
  if (url.length > 900_000) return "invalid";
  return url;
}

type ItemData = z.infer<typeof itemSchema>;
function buildData(d: ItemData): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const img = validateImage(d.imageUrl);
  if (img === "invalid") return { ok: false, error: "That image isn't supported or is too large (max ~600 KB)." };
  const chart = validateImage(d.sizeChartUrl);
  if (chart === "invalid") return { ok: false, error: "That size chart image isn't supported or is too large (max ~600 KB)." };
  return {
    ok: true,
    data: {
      title: d.title,
      description: d.description || null,
      priceInr: d.priceInr,
      imageUrl: img,
      hasSizes: d.hasSizes,
      sizes: d.hasSizes ? (d.sizes ?? []) : [],
      sizeChartUrl: d.hasSizes ? chart : null,
      // Sized items track stock per size; simple items use the integer stock.
      sizeStock: d.hasSizes ? (d.sizeStock && Object.keys(d.sizeStock).length > 0 ? d.sizeStock : null) : null,
      stock: d.hasSizes ? null : d.stock === undefined ? null : d.stock,
      active: d.active,
      featured: d.featured,
      order: d.order,
    },
  };
}

export async function createShopItem(input: ShopItemInput): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  const built = buildData(parsed.data);
  if (!built.ok) return built;

  const item = await prisma.shopItem.create({ data: built.data as never });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.item.create", targetType: "ShopItem", targetId: item.id, summary: `Added shop item "${parsed.data.title}"` });
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { ok: true };
}

export async function updateShopItem(id: string, input: ShopItemInput): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  const built = buildData(parsed.data);
  if (!built.ok) return built;

  await prisma.shopItem.update({ where: { id }, data: built.data as never });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.item.update", targetType: "ShopItem", targetId: id, summary: `Edited shop item "${parsed.data.title}"` });
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteShopItem(id: string): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const item = await prisma.shopItem.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "Item not found" };
  await prisma.shopItem.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.item.delete", targetType: "ShopItem", targetId: id, summary: `Deleted shop item "${item.title}"` });
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { ok: true };
}

const fulfilmentSchema = z.object({
  status: z.enum(["PAID", "SHIPPED", "DELIVERED", "CANCELLED"]),
  etaAt: z.string().trim().optional().nullable(), // yyyy-mm-dd from a date input
  trackingCarrier: z.string().trim().max(80).optional().nullable(),
  trackingNumber: z.string().trim().max(120).optional().nullable(),
  trackingUrl: z.string().trim().max(500).optional().nullable(),
});

export type OrderFulfilmentInput = {
  status: "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  etaAt?: string | null;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

export async function updateOrderFulfilment(id: string, input: OrderFulfilmentInput): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const parsed = fulfilmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid update" };
  const d = parsed.data;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { ok: false, error: "Order not found" };

  let etaAt: Date | null = null;
  if (d.etaAt) {
    const parsedDate = new Date(d.etaAt);
    if (Number.isNaN(parsedDate.getTime())) return { ok: false, error: "That delivery date isn't valid." };
    etaAt = parsedDate;
  }
  if (d.trackingUrl && !/^https?:\/\//i.test(d.trackingUrl)) {
    return { ok: false, error: "The tracking link must start with http:// or https://." };
  }

  const wasPaid = ["PAID", "SHIPPED", "DELIVERED"].includes(order.status);
  const nowCancelling = d.status === "CANCELLED" && order.status !== "CANCELLED";
  const nowShipping = d.status === "SHIPPED" && order.status !== "SHIPPED";

  // Cancelling a paid order: refund at Razorpay (once) and put stock back.
  let refundedAt: Date | null = order.refundedAt;
  if (nowCancelling && wasPaid && !order.refundedAt) {
    if (order.razorpayPaymentId && isRazorpayConfigured) {
      try {
        await refundRazorpayPayment(order.razorpayPaymentId, order.totalInr * 100);
        refundedAt = new Date();
      } catch (e) {
        return { ok: false, error: e instanceof Error ? `Refund failed: ${e.message}` : "Refund failed at Razorpay." };
      }
    }
    await restockOrder(order.id);
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: d.status,
      etaAt,
      trackingCarrier: d.trackingCarrier || null,
      trackingNumber: d.trackingNumber || null,
      trackingUrl: d.trackingUrl || null,
      refundedAt,
    },
  });

  // Tell the customer once it's on the way.
  if (nowShipping) await notifyOrderShipped(order.id);

  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.order.fulfilment", targetType: "Order", targetId: id, summary: `Set order ${d.status.toLowerCase()} for ${order.shipName}`, meta: { etaAt: d.etaAt ?? null, trackingNumber: d.trackingNumber ?? null, refunded: Boolean(refundedAt && !order.refundedAt) } });
  revalidatePath("/admin/shop/orders");
  revalidatePath("/shop/orders");
  return { ok: true };
}
