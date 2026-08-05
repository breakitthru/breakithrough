import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { setMoneyConfig } from "@/lib/admin-money-actions";
import { PageHeader, StatTile, Section } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { MoneyTabs } from "@/components/admin/money/money-tabs";
import { ConfigEditor } from "@/components/admin/config-editor";

export default async function PointsEconomyPage() {
  await requirePermission("money.view");
  const config = await getConfig();
  const [issuedAgg, spentAgg, balanceAgg] = await Promise.all([
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { gt: 0 } } }),
    prisma.pointsLedger.aggregate({ _sum: { delta: true }, where: { delta: { lt: 0 } } }),
    prisma.user.aggregate({ _sum: { pointsBalance: true } }),
  ]);
  const issued = issuedAgg._sum.delta ?? 0;
  const spent = Math.abs(spentAgg._sum.delta ?? 0);
  const unspent = balanceAgg._sum.pointsBalance ?? 0;
  const liability = config.rupeePerPoint ? `₹${(unspent * config.rupeePerPoint).toLocaleString("en-IN")}` : "—";

  return (
    <>
      <PageHeader eyebrow="Money" title="Points economy" subtitle="What a point is worth. The rewards shop can't price items until this is set." />
      <MoneyTabs />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatTile label="Points issued" value={issued.toLocaleString("en-IN")} />
        <StatTile label="Points spent" value={spent.toLocaleString("en-IN")} />
        <StatTile label="Unspent balance" value={unspent.toLocaleString("en-IN")} />
        <StatTile label="Liability" value={liability} hint={config.rupeePerPoint ? undefined : "Set ₹ per point"} tone={config.rupeePerPoint ? "neutral" : "alert"} />
      </div>

      {!config.rupeePerPoint && (
        <Card className="mb-6 border-[var(--color-caution)] bg-[var(--color-caution-subtle)]/40 p-4 text-sm text-[var(--color-ink)]">
          The field ships; the value does not exist yet. Until ₹ per point is set, reward prices can&rsquo;t be finalised.
        </Card>
      )}

      <Section title="Set the value">
        <ConfigEditor
          action={setMoneyConfig}
          fields={[
            { key: "rupeePerPoint", label: "₹ per point", value: config.rupeePerPoint, hint: "The rupee value of one point. Leave blank to keep it unset." },
            { key: "programPriceInr", label: "Program price (₹, one-time)", value: config.programPriceInr },
          ]}
        />
      </Section>
    </>
  );
}
