import Link from "next/link";
import { ArrowLeft, Gift } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { getProgramState, reflectionCount, getBadgesWithEarned } from "@/lib/program";
import { getConfig } from "@/lib/config";
import { BadgeIcon } from "@/components/app/badge-icon";

export default async function ProgressPage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const state = await getProgramState(user);
  const shownUp = user.streakCurrent;
  const reflections = await reflectionCount(user.id);
  const badges = await getBadgesWithEarned(user.id);
  const earned = badges.filter((b) => b.earned).length;
  const preview = badges.slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="max-w-[720px]">
        <Link
          href="/today"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <p className="eyebrow">Progress & rewards</p>
        <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
          Every step counts.
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          One point for every task you finish. Badges mark the moments worth remembering.
        </p>

        <div className="mt-7 rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)] p-7 text-[var(--color-brand-fg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            You&rsquo;ve shown up
          </p>
          <p className="mt-2 font-display text-[2.75rem] leading-none">
            {shownUp}
            <span className="ml-2 align-baseline text-base font-normal text-white/60">
              of {config.programDays} days
            </span>
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${Math.min(100, (shownUp / config.programDays) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/60">Streaks pause, never break — every return counts.</p>
        </div>

        <Card className="mt-5 grid grid-cols-3 divide-x divide-[var(--color-line)] p-0">
          {[
            { n: user.pointsBalance, l: "Points" },
            { n: earned, l: "Badges" },
            { n: reflections, l: "Reflections" },
          ].map((s) => (
            <div key={s.l} className="py-6 text-center">
              <p className="font-display text-3xl text-[var(--color-accent)]">{s.n}</p>
              <p className="eyebrow mt-1">{s.l}</p>
            </div>
          ))}
        </Card>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Badges</h2>
          <Link href="/progress/badges" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            See all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {preview.map((b, i) => (
            <Link
              key={b.id}
              href={`/progress/badges/${b.key}`}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <span className="transition-transform group-hover:-translate-y-0.5">
                <BadgeIcon badgeKey={b.key} earned={b.earned} index={i} />
              </span>
              <span className="text-xs text-[var(--color-ink-muted)]">{b.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Your points</p>
          <Link href="/progress/rewards" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            See shop
          </Link>
        </div>
        <Card className="mt-3 flex items-center gap-3 bg-[var(--color-brand-subtle)] p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] text-white">
            <Gift size={20} weight="fill" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--color-ink)]">
              {user.pointsBalance} points to spend
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Redeem them for merch in our online shop.
            </p>
          </div>
          <Link
            href="/progress/rewards"
            className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]"
          >
            Shop
          </Link>
        </Card>
      </aside>
    </div>
  );
}
