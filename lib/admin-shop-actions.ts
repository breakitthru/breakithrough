"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

const IMAGE_DATA_URL = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const itemSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(160),
  description: z.string().trim().max(600).optional().nullable(),
  priceInr: z.coerce.number().int().min(0).max(1_000_000),
  imageUrl: z.string().optional().nullable(),
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

export async function createShopItem(input: ShopItemInput): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  const img = validateImage(parsed.data.imageUrl);
  if (img === "invalid") return { ok: false, error: "That image isn't supported or is too large (max ~600 KB)." };

  const item = await prisma.shopItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      priceInr: parsed.data.priceInr,
      imageUrl: img,
      stock: parsed.data.stock === undefined ? null : parsed.data.stock,
      active: parsed.data.active,
      featured: parsed.data.featured,
      order: parsed.data.order,
    },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.item.create", targetType: "ShopItem", targetId: item.id, summary: `Added shop item "${parsed.data.title}"` });
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { ok: true };
}

export async function updateShopItem(id: string, input: ShopItemInput): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid item" };
  const img = validateImage(parsed.data.imageUrl);
  if (img === "invalid") return { ok: false, error: "That image isn't supported or is too large (max ~600 KB)." };

  await prisma.shopItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      priceInr: parsed.data.priceInr,
      imageUrl: img,
      stock: parsed.data.stock === undefined ? null : parsed.data.stock,
      active: parsed.data.active,
      featured: parsed.data.featured,
      order: parsed.data.order,
    },
  });
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

export async function setOrderStatus(id: string, status: "FULFILLED" | "CANCELLED"): Promise<Result> {
  const admin = await requirePermission("shop.manage");
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { ok: false, error: "Order not found" };
  await prisma.order.update({ where: { id }, data: { status } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "shop.order.status", targetType: "Order", targetId: id, summary: `Marked order ${status.toLowerCase()} for ${order.shipName}` });
  revalidatePath("/admin/shop/orders");
  return { ok: true };
}
