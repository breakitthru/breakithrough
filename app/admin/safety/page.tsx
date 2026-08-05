import Link from "next/link";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatTile, StatusPill, EmptyState } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { SafetyTabs } from "@/components/admin/safety/safety-tabs";

const DOOR_LABEL: Record<string, string> = { NOT_SAFE: "I'm not safe", RIDE_OUT: "About to relapse", TALK: "Need to talk" };

export default async function SafetyPage() {
  await requirePermission("safety.view");
  const dayAgo = new Date(Date.now() - 86_400_000);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [events, last24, unresolved] = await Promise.all([
    prisma.sosEvent.findMany({
      where: { createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, displayName: true, name: true } } },
    }),
    prisma.sosEvent.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.sosEvent.count({ where: { reviewedAt: null } }),
  ]);

  return (
    <>
      <PageHeader eyebrow="Safety" title="SOS log" subtitle="Every SOS event, logged for review. Opening one stops its automatic escalation." />
      <SafetyTabs />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Last 24 hours" value={last24} />
        <StatTile label="Unreviewed" value={unresolved} tone={unresolved > 0 ? "alert" : "neutral"} />
        <StatTile label="This week" value={events.length} />
      </div>

      {events.length === 0 ? (
        <EmptyState title="No SOS events this week." body="That's a good thing." />
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-3 py-3 font-medium">Member</th>
                <th className="px-3 py-3 font-medium">Door</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-sunken)]/40">
                  <td className="px-5 py-3">
                    <Link href={`/admin/safety/event/${e.id}`} className="font-medium text-[var(--color-ink)] hover:underline">
                      {e.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{e.user ? e.user.displayName ?? e.user.name ?? "Member" : "Logged out"}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{DOOR_LABEL[e.door] ?? e.door}</td>
                  <td className="px-3 py-3"><StatusPill status={e.reviewedAt ? "REVIEWED" : "OPEN"} label={e.reviewedAt ? "reviewed" : "needs review"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
