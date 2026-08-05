import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "@/lib/admin-money-actions";
import { PageHeader, StatTile, StatusPill, EmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { MoneyTabs } from "@/components/admin/money/money-tabs";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function PurchasesPage() {
  const admin = await requirePermission("money.view");
  const canAct = admin.effectiveRole === "OWNER" || admin.effectiveRole === "OPS";

  const [payments, paidAgg, refundedAgg] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { id: true, displayName: true, name: true } } } }),
    prisma.payment.aggregate({ _sum: { amountInr: true }, where: { status: "PAID" } }),
    prisma.payment.aggregate({ _sum: { amountInr: true }, where: { status: "REFUNDED" } }),
  ]);
  const paid = paidAgg._sum.amountInr ?? 0;
  const refunded = refundedAgg._sum.amountInr ?? 0;

  return (
    <>
      <PageHeader eyebrow="Money" title="Purchases" subtitle="Every payment. Refunds are recorded here (gateway refund is wired later)." />
      <MoneyTabs />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Collected" value={`₹${paid.toLocaleString("en-IN")}`} />
        <StatTile label="Refunded" value={`₹${refunded.toLocaleString("en-IN")}`} />
        <StatTile label="Ours to keep" value={`₹${(paid - refunded).toLocaleString("en-IN")}`} />
      </div>

      {payments.length === 0 ? (
        <EmptyState title="No payments yet." body="Purchases will appear here once members start paying." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">{p.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-3 py-3">
                    {p.user ? <Link href={`/admin/members/${p.user.id}`} className="text-[var(--color-ink)] hover:underline">{p.user.displayName ?? p.user.name ?? "Member"}</Link> : <span className="text-[var(--color-ink-faint)]">—</span>}
                  </td>
                  <td className="px-3 py-3">₹{p.amountInr.toLocaleString("en-IN")}</td>
                  <td className="px-3 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-3 py-3 text-right">
                    {canAct && p.status === "PAID" && (
                      <ConfirmButton
                        action={() => refundPayment(p.id)}
                        confirmTitle="Refund this payment?"
                        confirmBody="This records a refund. The gateway refund is not automated yet — process it there too."
                        confirmCta="Mark refunded"
                        className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-3 py-1.5 text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
                      >
                        Refund
                      </ConfirmButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
