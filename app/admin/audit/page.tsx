import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string }> }) {
  await requirePermission("audit.view");
  const { action } = await searchParams;
  const rows = await prisma.auditLog.findMany({
    where: action ? { action: { startsWith: action } } : {},
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Audit log"
        subtitle="Every change, appended and never edited. Filtering writes nothing; exporting does."
        actions={
          <Link href="/admin/audit/export" className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface)]">
            Export CSV
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="Nothing logged yet." body="Admin actions will appear here as they happen." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-3 py-3 font-medium">Who</th>
                <th className="px-3 py-3 font-medium">Action</th>
                <th className="px-3 py-3 font-medium">What</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0 align-top">
                  <td className="whitespace-nowrap px-5 py-3 text-[var(--color-ink-muted)]">{r.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.actorEmail ?? "system"}</td>
                  <td className="px-3 py-3"><Chip tone="neutral">{r.action}</Chip></td>
                  <td className="px-3 py-3 text-[var(--color-ink)]">{r.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
