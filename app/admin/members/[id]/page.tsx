import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { memberCurrentDay } from "@/lib/admin-metrics";
import { PageHeader, StatusPill, StatTile } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { DeleteMemberButton } from "@/components/admin/members/delete-member-button";

const TABS = ["overview", "progress", "payments", "safety", "privacy"] as const;
const TAB_LABEL: Record<string, string> = { overview: "Overview", progress: "Progress", payments: "Payments", safety: "Safety", privacy: "Reflections & Daylight" };

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await requirePermission("members.view");
  const { id } = await params;
  const { tab } = await searchParams;
  const active = TABS.includes((tab ?? "overview") as (typeof TABS)[number]) ? tab ?? "overview" : "overview";
  const config = await getConfig();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      consent: true,
      payments: { orderBy: { createdAt: "desc" } },
      sosEvents: { orderBy: { createdAt: "desc" } },
      _count: { select: { reflections: true, chatMessages: true, moods: true, completions: true, badges: true } },
    },
  });
  if (!user || user.staffRole) notFound();

  const name = user.displayName ?? user.name ?? "Member";
  const day = memberCurrentDay(user.programStartDate, config.programDays, config.dayRolloverHour);
  const canDelete = admin.effectiveRole === "OWNER" || admin.effectiveRole === "OPS";

  return (
    <>
      <Link href="/admin/members" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> Members
      </Link>
      <PageHeader
        eyebrow={`Day ${day} · ${user.deletedAt ? "erased" : "member"}`}
        title={name}
        subtitle={user.email ?? "—"}
        actions={<StatusPill status={user.plan} />}
      />

      <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/members/${id}?tab=${t}`}
            className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors ${active === t ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
          >
            {TAB_LABEL[t]}
          </Link>
        ))}
      </div>

      {active === "overview" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Current day" value={day} />
          <StatTile label="Points" value={user.pointsBalance} />
          <StatTile label="Streak" value={`${user.streakCurrent}d`} hint={`Longest ${user.streakLongest}d`} />
          <Card className="p-5 sm:col-span-3">
            <h3 className="font-semibold text-[var(--color-ink)]">Details</h3>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Joined</dt><dd>{user.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</dd></div>
              <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Program start</dt><dd>{user.programStartDate?.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) ?? "—"}</dd></div>
              <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Trusted contact</dt><dd>{user.trustedName ?? "—"}</dd></div>
              <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Reason for joining</dt><dd className="max-w-[60%] truncate">{user.whyIStarted ?? "—"}</dd></div>
            </dl>
          </Card>
          {canDelete && !user.deletedAt && (
            <div className="sm:col-span-3">
              <DeleteMemberButton userId={user.id} />
            </div>
          )}
        </div>
      )}

      {active === "progress" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Tasks completed" value={user._count.completions} />
          <StatTile label="Badges earned" value={user._count.badges} />
          <StatTile label="Mood check-ins" value={user._count.moods} />
        </div>
      )}

      {active === "payments" && (
        <Card className="p-0">
          {user.payments.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-ink-muted)]">No payments.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]"><th className="px-5 py-3 font-medium">When</th><th className="px-3 py-3 font-medium">Amount</th><th className="px-3 py-3 font-medium">Status</th></tr></thead>
              <tbody>
                {user.payments.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-5 py-3 text-[var(--color-ink-muted)]">{p.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-3">₹{p.amountInr.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3"><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {active === "safety" && (
        <Card className="p-0">
          {user.sosEvents.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-ink-muted)]">No SOS events.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]"><th className="px-5 py-3 font-medium">When</th><th className="px-3 py-3 font-medium">Door</th><th className="px-3 py-3 font-medium">Status</th></tr></thead>
              <tbody>
                {user.sosEvents.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-5 py-3 text-[var(--color-ink-muted)]">{e.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-3 py-3">{e.door.replace("_", " ").toLowerCase()}</td>
                    <td className="px-3 py-3"><StatusPill status={e.reviewedAt ? "REVIEWED" : "OPEN"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {active === "privacy" && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]"><Lock size={20} weight="fill" /></span>
            <div>
              <h3 className="font-semibold text-[var(--color-ink)]">Private by design.</h3>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Reflections and Daylight chat are the member&rsquo;s own. There is no reader here — only counts and
                consent. If they need their data, it is exported to them, never to us.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Reflections" value={user._count.reflections} />
            <StatTile label="Chat messages" value={user._count.chatMessages} />
            <StatTile label="Store journal" value={user.consent?.storeJournal ? "On" : "Off"} />
            <StatTile label="Store chat" value={user.consent?.storeChat ? "On" : "Off"} />
          </div>
        </Card>
      )}
    </>
  );
}
