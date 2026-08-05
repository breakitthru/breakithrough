import Link from "next/link";
import { Lifebuoy, CreditCard, Gift, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";

export default async function AlertsPage() {
  await requireStaff();
  const config = await getConfig();
  const [sos, failed, redemptions, helplines, rota] = await Promise.all([
    prisma.sosEvent.count({ where: { reviewedAt: null } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.redemption.count({ where: { status: "REQUESTED" } }),
    prisma.helpline.count({ where: { active: true } }),
    prisma.siteConfig.findUnique({ where: { key: "onCallRota" } }),
  ]);

  const alerts: { icon: React.ReactNode; title: string; href: string; tone: string }[] = [];
  if (sos > 0) alerts.push({ icon: <Lifebuoy size={18} weight="fill" />, title: `${sos} SOS event${sos === 1 ? "" : "s"} to review`, href: "/admin/safety", tone: "var(--color-crisis)" });
  if (failed > 0) alerts.push({ icon: <CreditCard size={18} weight="fill" />, title: `${failed} failed payment${failed === 1 ? "" : "s"}`, href: "/admin/money/failed", tone: "var(--color-caution)" });
  if (redemptions > 0) alerts.push({ icon: <Gift size={18} weight="fill" />, title: `${redemptions} redemption${redemptions === 1 ? "" : "s"} to fulfil`, href: "/admin/money/rewards", tone: "var(--color-brand)" });
  if (!config.rupeePerPoint) alerts.push({ icon: <WarningCircle size={18} weight="fill" />, title: "₹ per point is still unset", href: "/admin/money/points", tone: "var(--color-caution)" });
  if (helplines === 0) alerts.push({ icon: <WarningCircle size={18} weight="fill" />, title: "No helplines configured", href: "/admin/safety/on-call", tone: "var(--color-crisis)" });
  if (!rota) alerts.push({ icon: <WarningCircle size={18} weight="fill" />, title: "On-call rota is empty", href: "/admin/safety/on-call", tone: "var(--color-caution)" });

  return (
    <>
      <PageHeader eyebrow="Alerts" title="Needs attention" subtitle="Everything waiting on a human, in one place." />
      {alerts.length === 0 ? (
        <EmptyState title="You're all caught up." body="No unresolved events, failed payments, or gaps." />
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((a, i) => (
            <Link key={i} href={a.href}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-[var(--color-line-strong)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-surface-sunken)", color: a.tone }}>{a.icon}</span>
                <span className="flex-1 font-medium text-[var(--color-ink)]">{a.title}</span>
                <span className="text-[var(--color-ink-faint)]">→</span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
