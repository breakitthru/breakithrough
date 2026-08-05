import Link from "next/link";
import { requirePermission, OWNER_EMAILS } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS, PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";
import { PageHeader, Section } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";
import { StaffRow } from "@/components/admin/staff/staff-row";

const MATRIX_ROLES = ["OWNER", "OPS", "CLINICIAN", "MODERATOR"] as const;

export default async function StaffPage() {
  await requirePermission("staff.manage");
  const staff = await prisma.user.findMany({
    where: { staffRole: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, displayName: true, name: true, staffRole: true },
  });

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Staff & roles"
        subtitle="Everyone with a sign-in."
        actions={
          <Link href="/admin/staff/invite" className="rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]">
            Invite someone
          </Link>
        }
      />

      <Card className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="px-5 py-3 font-medium">Person</th>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <StaffRow
                key={s.id}
                id={s.id}
                name={s.displayName ?? s.name ?? s.email ?? "Staff"}
                email={s.email ?? "—"}
                role={s.staffRole!}
                isOwnerEmail={!!s.email && OWNER_EMAILS.includes(s.email.toLowerCase())}
              />
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-[var(--color-ink-muted)]">Only the owner has access. Invite someone to share the load.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      <Section title="What each role can do">
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Permission</th>
                {MATRIX_ROLES.map((r) => <th key={r} className="px-3 py-3 text-center font-medium">{r[0] + r.slice(1).toLowerCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm) => (
                <tr key={perm} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-2.5 text-[var(--color-ink)]">{PERMISSION_LABELS[perm]}</td>
                  {MATRIX_ROLES.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {ROLE_PERMISSIONS[r].includes(perm) ? <span className="text-[var(--color-success)]">●</span> : <span className="text-[var(--color-line-strong)]">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-3 text-xs text-[var(--color-ink-faint)]">Specialists have no admin-panel access (their console is a separate, future area).</p>
        <div className="mt-4"><Chip tone="neutral">Owner: {OWNER_EMAILS.join(", ")}</Chip></div>
      </Section>
    </>
  );
}
