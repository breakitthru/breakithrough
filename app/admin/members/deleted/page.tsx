import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";

export default async function DeletedAccountsPage() {
  await requirePermission("members.view");
  const rows = await prisma.deletedAccount.findMany({ orderBy: { deletedAt: "desc" }, take: 200 });

  return (
    <>
      <Link href="/admin/members" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> Members
      </Link>
      <PageHeader eyebrow="Members" title="Deleted accounts" subtitle="What legally survives an erasure. There is no name on these records." />

      {rows.length === 0 ? (
        <EmptyState title="No erased accounts." body="DPDP deletion tombstones appear here." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Record</th>
                <th className="px-3 py-3 font-medium">Erased</th>
                <th className="px-3 py-3 font-medium">Payments kept</th>
                <th className="px-3 py-3 font-medium">Retention</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3 font-mono font-medium text-[var(--color-ink)]">{r.pseudoId}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.deletedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.paymentsRetained}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-faint)]">{Array.isArray(r.retentionReasons) ? (r.retentionReasons as string[]).join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
