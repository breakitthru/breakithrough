import Link from "next/link";
import { ArrowLeft, Gift, Lock, PenNib, Leaf, Drop } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { demoUser, badges } from "@/lib/mock";
import { getConfig } from "@/lib/config";

const BADGE_ICONS = [PenNib, Leaf, Drop];

export default async function ProgressPage() {
  const config = await getConfig();
  const earned = badges.filter((b) => b.earned);
  const preview = badges.slice(0, 4);
  const reflectionsCount = 8;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
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

        {/* Shown-up hero */}
        <div className="mt-7 rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)] p-7 text-[var(--color-brand-fg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
            You&rsquo;ve shown up
          </p>
          <p className="mt-2 font-display text-[2.75rem] leading-none">
            {demoUser.currentDay}
            <span className="ml-2 align-baseline text-base font-normal text-white/60">
              of {config.programDays} days
            </span>
          </p>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${(demoUser.currentDay / config.programDays) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/60">Streaks pause, never break — every return counts.</p>
        </div>

        {/* Stat row */}
        <Card className="mt-5 grid grid-cols-3 divide-x divide-[var(--color-line)] p-0">
          {[
            { n: demoUser.pointsBalance, l: "Points" },
            { n: earned.length, l: "Badges" },
            { n: reflectionsCount, l: "Reflections" },
          ].map((s) => (
            <div key={s.l} className="py-6 text-center">
              <p className="font-display text-3xl text-[var(--color-accent)]">{s.n}</p>
              <p className="eyebrow mt-1">{s.l}</p>
            </div>
          ))}
        </Card>

        {/* Badges preview */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Badges</h2>
          <Link href="/progress/badges" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            See all
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {preview.map((b, i) => {
            const Icon = BADGE_ICONS[i] ?? Gift;
            return (
              <div key={b.id} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                    b.earned
                      ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]"
                  }`}
                >
                  {b.earned ? <Icon size={26} /> : <Lock size={22} />}
                </span>
                <span className="text-xs text-[var(--color-ink-muted)]">{b.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right rail — points */}
      <aside className="hidden lg:block">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Your points</p>
          <Link href="/progress/rewards" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            See shop
          </Link>
        </div>
        <Card className="mt-3 flex items-center gap-3 bg-[var(--color-brand-subtle)] p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] text-white">
            <Gift size={20} weight="fill" />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-[var(--color-ink)]">
              {demoUser.pointsBalance} points to spend
            </p>
            <p className="text-xs text-[var(--color-ink-muted)]">Redeem for merch in our shop</p>
          </div>
        </Card>
        <Link href="/progress/rewards">
          <button className="mt-3 w-full rounded-[var(--radius-pill)] bg-[var(--color-accent)] py-2.5 text-sm font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]">
            Shop
          </button>
        </Link>
      </aside>
    </div>
  );
}
