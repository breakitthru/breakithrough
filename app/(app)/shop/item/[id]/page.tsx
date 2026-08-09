import { notFound } from "next/navigation";
import { requireOnboardedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ItemDetail } from "@/components/app/shop/item-detail";

export default async function ShopItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOnboardedUser();
  const { id } = await params;
  const item = await prisma.shopItem.findFirst({ where: { id, active: true } });
  if (!item) notFound();

  return (
    <ItemDetail
      item={{
        id: item.id,
        title: item.title,
        description: item.description,
        priceInr: item.priceInr,
        imageUrl: item.imageUrl,
        hasSizes: item.hasSizes,
        sizes: item.sizes,
        sizeChartUrl: item.sizeChartUrl,
        stock: item.stock,
      }}
    />
  );
}
