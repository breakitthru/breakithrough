import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { MoneyTabs } from "@/components/admin/money/money-tabs";

export default async function FailedPaymentsPage() {
  await requirePermission("money.view");
  const rows = await prisma.payment.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, displayName: true, name: true } } },
  });

  return (
    <>
      <PageHeader eyebrow="Money" title="Failed payments" subtitle="Retries happen gently. There is no lockout by design." />
      <MoneyTabs />
      {rows.length === 0 ? (
        <EmptyState title="Nothing failing right now." body="Failed charges will collect here for follow-up." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">{p.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-3 py-3">{p.user ? <Link href={`/admin/members/${p.user.id}`} className="text-[var(--color-ink)] hover:underline">{p.user.displayName ?? p.user.name ?? "Member"}</Link> : "—"}</td>
                  <td className="px-3 py-3">₹{p.amountInr.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
