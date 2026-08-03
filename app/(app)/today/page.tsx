import Link from "next/link";
import {
  Trophy,
  Bell,
  VideoCamera,
  UsersThree,
  DotsThreeOutline,
  PencilSimpleLine,
  SmileySad,
  SmileyMeh,
  Smiley,
  SmileyWink,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay, getDayView } from "@/lib/program";
import { getConfig } from "@/lib/config";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function categoryLabel(c: string) {
  return c[0] + c.slice(1).toLowerCase();
}

export default async function TodayPage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const today = currentDay(user);
  const day = await getDayView(user.id, today);
  const name = user.displayName ?? user.name ?? "there";
  const now = new Date();
  const weekday = now.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase();
  const daysToDaylight = config.programDays - today;

  const mandatory = day?.tasks.filter((t) => t.mandatory) ?? [];
  const optional = day?.tasks.filter((t) => !t.mandatory) ?? [];
  const headline = mandatory.find((t) => !t.completed) ?? mandatory[0];
  const progress = day?.progress ?? { done: 0, total: 0, optionalDone: 0 };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="max-w-[720px]">
        <header className="mb-7 flex items-start justify-between">
          <div>
            <p className="eyebrow">
              {weekday} · Day {today}
            </p>
            <h1 className="font-display mt-1 text-[2.5rem] leading-tight text-[var(--color-ink)]">
              {greeting(now.getHours())}, {name}.
            </h1>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[var(--color-ink-muted)]">
            <Link
              href="/progress"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:opacity-80"
            >
              <Trophy size={20} weight="fill" />
              {user.pointsBalance}
            </Link>
            <Link href="/notifications" aria-label="Notifications" className="hover:text-[var(--color-ink)]">
              <Bell size={22} />
            </Link>
          </div>
        </header>

        {/* Day banner */}
        <Link href="/journey" className="block">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)] p-7 text-[var(--color-brand-fg)] shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
              Your journey · Phase {day?.phaseOrder ?? 1} of 4
            </p>
            <h2 className="font-display mt-2 text-[2rem] leading-tight">{day?.phaseName ?? "Steady breath"}</h2>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${(today / config.programDays) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/70">
              <span>
                Day {today} of {config.programDays}
              </span>
              <span>{daysToDaylight} days to daylight</span>
            </div>
          </div>
        </Link>

        {/* Today's tasks entry */}
        <Link href={`/journey/day/${today}`} className="mt-5 block">
          <Card className="flex items-center gap-4 p-6 transition-colors hover:border-[var(--color-line-strong)]">
            <div className="flex-1">
              <p className="eyebrow">
                Today&rsquo;s {progress.total}
                {optional.length ? ` · ${optional.length} optional` : ""}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
                {headline ? headline.title : "You're all done for today"}
              </h3>
              {headline && (
                <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">
                  {categoryLabel(headline.category)} · {headline.estimatedMinutes} min · +
                  {headline.points} point
                </p>
              )}
            </div>
            <span className="flex items-center gap-1 text-[var(--color-ink-faint)]">
              <DotsThreeOutline size={18} />
              <span className="text-xs">
                {progress.done}/{progress.total}
              </span>
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)]">
              <PencilSimpleLine size={20} />
            </span>
          </Card>
        </Link>

        {/* Reflection prompt */}
        <Card className="mt-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">How&rsquo;s today feeling?</h3>
            <Link
              href="/reflections/new"
              className="text-sm text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
            >
              Write instead
            </Link>
          </div>
          <div className="mt-4 flex gap-3">
            {[
              { Icon: SmileySad, label: "Heavy" },
              { Icon: SmileyMeh, label: "Flat" },
              { Icon: Smiley, label: "Okay" },
              { Icon: SmileyWink, label: "Lighter" },
            ].map(({ Icon, label }) => (
              <Link
                key={label}
                href="/reflections/new"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                aria-label={label}
              >
                <Icon size={24} />
              </Link>
            ))}
          </div>
        </Card>

        <p className="mt-10 text-center text-sm italic text-[var(--color-ink-faint)]">
          Just begin. That&rsquo;s enough.
        </p>
      </div>

      {/* Right context rail */}
      <aside className="hidden flex-col gap-4 lg:flex">
        <Link href="/sessions">
          <Card className="p-5 transition-colors hover:border-[var(--color-line-strong)]">
            <VideoCamera size={22} className="text-[var(--color-ink-muted)]" />
            <h4 className="mt-3 font-semibold text-[var(--color-ink)]">1:1 Sessions</h4>
            <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">Book when you need it</p>
          </Card>
        </Link>
        <Link href="/community">
          <Card className="p-5 transition-colors hover:border-[var(--color-line-strong)]">
            <UsersThree size={22} className="text-[var(--color-ink-muted)]" />
            <h4 className="mt-3 font-semibold text-[var(--color-ink)]">Community</h4>
            <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">Coming soon</p>
          </Card>
        </Link>
      </aside>
    </div>
  );
}
