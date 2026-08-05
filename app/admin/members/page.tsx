import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { memberCurrentDay } from "@/lib/admin-metrics";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { MemberFilters } from "@/components/admin/members/member-filters";

const PLANS = ["TRIAL", "ACTIVE", "EXPIRED", "COMPLETED"] as const;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  await requirePermission("members.view");
  const { q, plan } = await searchParams;
  const config = await getConfig();

  const where = {
    deletedAt: null,
    staffRole: null,
    ...(plan && PLANS.includes(plan as (typeof PLANS)[number]) ? { plan: plan as (typeof PLANS)[number] } : {}),
    ...(q
      ? { OR: [{ displayName: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
      : {}),
  };

  const [members, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, displayName: true, name: true, email: true, programStartDate: true, streakCurrent: true, pointsBalance: true, plan: true, updatedAt: true },
    }),
    prisma.user.count({ where: { deletedAt: null, staffRole: null } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Members"
        title="Members"
        subtitle={`${total.toLocaleString("en-IN")} members`}
        actions={
          <Link href="/admin/members/deleted" className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface)]">
            Deleted accounts
          </Link>
        }
      />
      <MemberFilters q={q ?? ""} plan={plan ?? ""} />

      {members.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[var(--color-ink-muted)]">No members match.</Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Day</th>
                <th className="px-3 py-3 font-medium">Streak</th>
                <th className="px-3 py-3 font-medium">Points</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const day = memberCurrentDay(m.programStartDate, config.programDays, config.dayRolloverHour);
                return (
                  <tr key={m.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-sunken)]/40">
                    <td className="px-5 py-3">
                      <Link href={`/admin/members/${m.id}`} className="font-medium text-[var(--color-ink)] hover:underline">
                        {m.displayName ?? m.name ?? "Member"}
                      </Link>
                      <p className="text-xs text-[var(--color-ink-faint)]">{m.email ?? "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">Day {day}</td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{m.streakCurrent}d</td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{m.pointsBalance}</td>
                    <td className="px-3 py-3"><StatusPill status={m.plan} /></td>
                    <td className="px-3 py-3 text-[var(--color-ink-faint)]">{m.updatedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
