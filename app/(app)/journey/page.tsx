import Link from "next/link";
import { Check, Flag } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay, getJourney, type DayStatus } from "@/lib/program";
import { phaseForDay, PHASES } from "@/lib/config";

const WAVE = [0, 70, 100, 70, 0, -70, -100, -70];

function DayNode({ day, status }: { day: number; status: DayStatus }) {
  const isToday = status === "today";
  const isDone = status === "completed";
  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "flex items-center justify-center rounded-full font-medium transition-colors",
          isToday
            ? "h-16 w-16 bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-lg ring-4 ring-[var(--color-accent-subtle)]"
            : isDone
              ? "h-11 w-11 bg-[var(--color-brand-ink)] text-white text-sm"
              : "h-11 w-11 border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-faint)] text-sm",
        ].join(" ")}
      >
        {day}
      </div>
      {isToday && (
        <span className="rounded-[var(--radius-pill)] bg-[var(--color-accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-subtle-ink)]">
          Today
        </span>
      )}
    </div>
  );
}

export default async function JourneyPage() {
  const user = await requireOnboardedUser();
  const today = currentDay(user);
  const currentPhase = phaseForDay(today);
  const journey = getJourney(today);
  const focus = journey.find((p) => p.order === currentPhase.order)!;
  const prevPhase = PHASES.find((p) => p.order === currentPhase.order - 1);
  const nextPhase = PHASES.find((p) => p.order === currentPhase.order + 1);

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-10">
        <p className="eyebrow">
          Phase {currentPhase.order} · Days {currentPhase.dayStart}&ndash;{currentPhase.dayEnd}
        </p>
        <div className="mt-1 flex items-baseline justify-between">
          <h1 className="font-display text-[2.75rem] leading-tight text-[var(--color-ink)]">
            {currentPhase.name}
          </h1>
          <Chip tone="accent">Day {today}</Chip>
        </div>
      </header>

      {prevPhase && (
        <div className="mb-2 flex justify-center">
          <Link href={`/journey/phase/${prevPhase.order}`}>
            <Chip tone="brand" className="gap-1.5">
              <Check size={14} weight="bold" /> Phase {prevPhase.order} · {prevPhase.name}
            </Chip>
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center">
        {focus.days.map((d, i) => (
          <div key={d.dayNumber} className="flex flex-col items-center">
            <div style={{ transform: `translateX(${WAVE[i % WAVE.length]}px)` }}>
              {d.status === "upcoming" ? (
                <DayNode day={d.dayNumber} status={d.status} />
              ) : (
                <Link href={`/journey/day/${d.dayNumber}`}>
                  <DayNode day={d.dayNumber} status={d.status} />
                </Link>
              )}
            </div>
            {i < focus.days.length - 1 && (
              <div
                className="my-2 flex flex-col items-center gap-1.5"
                style={{ transform: `translateX(${(WAVE[i % WAVE.length] + WAVE[(i + 1) % WAVE.length]) / 2}px)` }}
              >
                {[0, 1, 2].map((k) => (
                  <span key={k} className="h-1 w-1 rounded-full bg-[var(--color-line-strong)]" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {nextPhase && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-ink-muted)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)]">
            <Flag size={16} />
          </span>
          Phase {nextPhase.order} · {nextPhase.name} — unlocks Day {nextPhase.dayStart}
        </div>
      )}
    </div>
  );
}
