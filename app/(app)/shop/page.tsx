import { requireOnboardedUser } from "@/lib/session";
import { getRewards } from "@/lib/program";
import { prisma } from "@/lib/prisma";
import { ShopTabs } from "@/components/app/shop/shop-tabs";

export default async function ShopPage() {
  const user = await requireOnboardedUser();

  const [rewards, redemptions, items] = await Promise.all([
    getRewards(),
    prisma.redemption.findMany({ where: { userId: user.id }, select: { rewardId: true } }),
    prisma.shopItem.findMany({ where: { active: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" } ] }),
  ]);

  return (
    <ShopTabs
      balance={user.pointsBalance}
      rewards={rewards.map((r) => ({ id: r.id, title: r.title, description: r.description, pointsCost: r.pointsCost, featured: r.featured }))}
      redeemedIds={redemptions.map((r) => r.rewardId)}
      items={items.map((i) => ({ id: i.id, title: i.title, description: i.description, priceInr: i.priceInr, imageUrl: i.imageUrl, stock: i.stock, featured: i.featured, hasSizes: i.hasSizes }))}
    />
  );
}
