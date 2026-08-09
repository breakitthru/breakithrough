import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ShopManager } from "@/components/admin/shop/shop-manager";

export default async function AdminShopPage() {
  await requirePermission("shop.manage");
  const rows = await prisma.shopItem.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageHeader eyebrow="Shop" title="Shop items" subtitle="Products members buy with money. Add items, set prices, upload an image and manage stock." />
      <ShopManager
        items={rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          priceInr: r.priceInr,
          imageUrl: r.imageUrl,
          hasSizes: r.hasSizes,
          sizes: r.sizes,
          sizeChartUrl: r.sizeChartUrl,
          stock: r.stock,
          active: r.active,
          featured: r.featured,
          order: r.order,
        }))}
      />
    </>
  );
}
