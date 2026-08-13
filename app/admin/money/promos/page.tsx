import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { MoneyTabs } from "@/components/admin/money/money-tabs";
import { PromoManager } from "@/components/admin/money/promo-manager";

export default async function PromosPage() {
  await requirePermission("money.view");
  const rows = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader eyebrow="Money" title="Promo codes" subtitle="Discount codes for the one-time program purchase. Members enter them at checkout." />
      <MoneyTabs />
      <PromoManager
        promos={rows.map((p) => ({
          id: p.id,
          code: p.code,
          discountType: p.discountType,
          value: p.value,
          active: p.active,
          maxRedemptions: p.maxRedemptions,
          redeemedCount: p.redeemedCount,
          expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
        }))}
      />
    </>
  );
}
