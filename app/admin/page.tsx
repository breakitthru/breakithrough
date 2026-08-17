import Link from "next/link";
import { Lifebuoy, UsersThree, CheckCircle, WarningCircle, Circle } from "@phosphor-icons/react/dist/ssr";
import { Card, Chip } from "@/components/ui/card";
import { requirePermission } from "@/lib/admin";
import { getOverviewMetrics } from "@/lib/admin-metrics";
import { PageHeader, StatTile, EmptyState } from "@/components/admin/ui";

const PHASE_BAR = ["#0e241a", "#1e4032", "#2c5342", "#5f6e64"];

export default async function AdminOverviewPage() {
  await requirePermission("overview.view");
  const m = await getOverviewMetrics();
  const now = new Date();
  const asOf = now.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  const maxBar = Math.max(1, ...m.perDay);

  return (
    <>
      {m.sosUnresolved > 0 && (
        <Card className="mb-6 flex items-center justify-between gap-4 border-[var(--color-crisis)] bg-[var(--color-crisis-subtle)]/50 p-5">
          <div className="flex items-start gap-3">
            <Lifebuoy size={22} className="mt-0.5 text-[var(--color-crisis)]" weight="fill" />
            <div>
              <p className="font-semibold text-[var(--color-ink)]">
                {m.sosUnresolved} SOS {m.sosUnresolved === 1 ? "event is" : "events are"} still unreviewed.
              </p>
              <p className="text-sm text-[var(--color-ink-muted)]">Opening an event stops the automatic escalation from firing.</p>
            </div>
          </div>
          <Link href="/admin/safety" className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]">
            Open the SOS log
          </Link>
        </Card>
      )}

      <PageHeader
        eyebrow="Overview"
        title="Overview"
        subtitle={m.launched ? `As of ${asOf}` : "Not launched yet · nobody has signed up"}
        actions={
          <Chip tone={m.launched ? "neutral" : "accent"} className="uppercase tracking-wide">
            {m.launched ? "Last 7 days" : "Pre-launch"}
          </Chip>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active members"
          value={m.launched ? m.totalMembers.toLocaleString("en-IN") : "—"}
          hint={m.launched ? `+${m.newThisWeek} this week · ${m.insidePct}% still inside` : "Nothing yet"}
        />
        <StatTile
          label="Completed yesterday"
          value={m.completedYesterdayPct === null ? "—" : `${m.completedYesterdayPct}%`}
          hint={m.launched ? `${m.completedYesterday} of ${m.totalMembers}` : "No days completed yet"}
        />
        <StatTile
          label="SOS · last 24 hours"
          value={m.sosLast24h}
          tone={m.sosUnresolved > 0 ? "alert" : "neutral"}
          hint={m.sosUnresolved > 0 ? `${m.sosUnresolved} unresolved` : m.sosLast24h > 0 ? "all reviewed" : "No events"}
        />
      </div>

      {m.launched ? (
        <>
          {/* Distribution */}
          <Card className="mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">Where the {m.totalMembers.toLocaleString("en-IN")} are today</h2>
              {m.medianDay && <span className="text-sm text-[var(--color-ink-muted)]">Median · Day {m.medianDay}</span>}
            </div>
            <div className="flex h-40 items-end gap-[2px]">
              {m.perDay.map((c, i) => {
                const day = i + 1;
                const phaseIdx = m.phases.findIndex((p) => day >= p.dayStart && day <= p.dayEnd);
                return (
                  <div
                    key={i}
                    title={`Day ${day} · ${c}`}
                    className="flex-1 rounded-t-[2px]"
                    style={{ height: `${(c / maxBar) * 100}%`, minHeight: c > 0 ? 3 : 1, backgroundColor: c > 0 ? PHASE_BAR[phaseIdx] ?? "#5f6e64" : "var(--color-line)" }}
                  />
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 border-t border-[var(--color-line)] pt-3 text-xs text-[var(--color-ink-muted)]">
              {m.phases.map((p, i) => (
                <div key={p.order} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_BAR[i] }} />
                  {p.order} · {p.name} · {p.count}
                </div>
              ))}
            </div>
          </Card>

          {/* Needs a look */}
          <Card className="mt-6 p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">Needs a look</h2>
              <Link href="/admin/members" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                All members →
              </Link>
            </div>
            {m.needsLook.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-[var(--color-ink-muted)]">Nothing flagged right now.</p>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                      <th className="px-6 py-2 font-medium">Member</th>
                      <th className="px-3 py-2 font-medium">Day</th>
                      <th className="px-3 py-2 font-medium">Streak</th>
                      <th className="px-3 py-2 font-medium">Points</th>
                      <th className="px-3 py-2 font-medium">Why it&rsquo;s flagged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.needsLook.map((r) => (
                      <tr key={r.id} className="border-b border-[var(--color-line)] last:border-0 hover:bg-[var(--color-surface-sunken)]/40">
                        <td className="px-6 py-3">
                          <Link href={`/admin/members/${r.id}`} className="font-medium text-[var(--color-ink)] hover:underline">
                            {r.name}
                          </Link>
                          <p className="text-xs text-[var(--color-ink-faint)]">{r.phaseName}</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-ink-muted)]">Day {r.day}</td>
                        <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.streak}d</td>
                        <td className="px-3 py-3 text-[var(--color-ink-muted)]">{r.points}</td>
                        <td className="px-3 py-3">
                          <Chip tone={r.tone}>{r.reason}</Chip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          {/* Launch checklist */}
          <Card className="mt-6 p-6">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Before the first member arrives</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {m.checklist.map((c, i) => {
                const Icon = c.state === "done" ? CheckCircle : c.state === "warn" ? WarningCircle : Circle;
                const color = c.state === "done" ? "var(--color-success)" : c.state === "warn" ? "var(--color-caution)" : "var(--color-crisis)";
                return (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-ink)]">
                    <Icon size={18} weight="fill" style={{ color }} className="mt-0.5 shrink-0" />
                    {c.label}
                  </li>
                );
              })}
            </ul>
          </Card>
          <div className="mt-6">
            <EmptyState
              icon={<UsersThree size={22} />}
              title="No members yet."
              body="The first sign-up appears here within seconds of going live. Nothing on this screen needs setting up."
            />
          </div>
        </>
      )}
    </>
  );
}
