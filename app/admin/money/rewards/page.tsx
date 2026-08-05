import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { setRedemptionStatus } from "@/lib/admin-money-actions";
import { PageHeader, Section, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { MoneyTabs } from "@/components/admin/money/money-tabs";
import { RewardManager } from "@/components/admin/money/reward-manager";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function RewardsPage() {
  const admin = await requirePermission("money.view");
  const canAct = ["OWNER", "OPS"].includes(admin.effectiveRole);

  const [rewards, queue] = await Promise.all([
    prisma.reward.findMany({ orderBy: { order: "asc" } }),
    prisma.redemption.findMany({
      where: { status: "REQUESTED" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, displayName: true, name: true } }, reward: { select: { title: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Money" title="Rewards" subtitle="What points buy, and the queue of redemptions to fulfil." />
      <MoneyTabs />

      <RewardManager rewards={rewards} />

      <Section title={`Redemption queue${queue.length ? ` · ${queue.length}` : ""}`}>
        {queue.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[var(--color-ink-muted)]">Nothing waiting.</Card>
        ) : (
          <Card className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-3 py-3 font-medium">Member</th>
                  <th className="px-3 py-3 font-medium">Reward</th>
                  <th className="px-3 py-3 font-medium">Points</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {queue.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-5 py-3 text-[var(--color-ink-muted)]">{r.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="px-3 py-3">{r.user ? <Link href={`/admin/members/${r.user.id}`} className="text-[var(--color-ink)] hover:underline">{r.user.displayName ?? r.user.name ?? "Member"}</Link> : "—"}</td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.reward.title}</td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.pointsSpent}</td>
                    <td className="px-3 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-3 py-3">
                      {canAct && (
                        <div className="flex items-center justify-end gap-2">
                          <ConfirmButton action={() => setRedemptionStatus(r.id, "FULFILLED")} className="rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]">
                            Mark posted
                          </ConfirmButton>
                          <ConfirmButton action={() => setRedemptionStatus(r.id, "CANCELLED")} confirmTitle="Cancel this redemption?" confirmCta="Cancel it" className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-3 py-1.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]">
                            Cancel
                          </ConfirmButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </Section>
    </>
  );
}
