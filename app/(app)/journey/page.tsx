import Link from "next/link";
import { Check, Flag } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { getProgramState, type DayStatus } from "@/lib/program";
import { phaseForDay, PHASES } from "@/lib/config";

// Serpentine road geometry. Nodes wander left/right down the page; a dotted SVG
// path threads through their centres and the opaque nodes sit on top, so the
// dots only show in the gaps — matching the "road" mockup (D25).
const WIDTH = 480;
const CENTER_X = WIDTH / 2;
const AMP = 132;
const ROW_H = 82;
const PAD_Y = 52;

function nodeX(i: number) {
  return CENTER_X + Math.sin((i + 0.6) * 0.72) * AMP;
}

function DayCircle({ day, status }: { day: number; status: DayStatus }) {
  const base =
    "flex items-center justify-center rounded-full font-medium transition-colors";
  if (status === "today") {
    return (
      <div
        className={`${base} h-16 w-16 bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-lg shadow-[var(--shadow-card)] ring-[6px] ring-[var(--color-accent-subtle)]`}
      >
        {day}
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className={`${base} h-12 w-12 bg-[var(--color-brand-ink)] text-white text-sm`}>
        {day}
      </div>
    );
  }
  if (status === "available") {
    return (
      <div
        className={`${base} h-12 w-12 border-2 border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-accent-subtle-ink)] text-sm`}
      >
        {day}
      </div>
    );
  }
  return (
    <div
      className={`${base} h-12 w-12 border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-faint)] text-sm`}
    >
      {day}
    </div>
  );
}

export default async function JourneyPage() {
  const user = await requireOnboardedUser();
  const state = await getProgramState(user);
  const currentPhase = phaseForDay(state.resumeDay);
  const prevPhase = PHASES.find((p) => p.order === currentPhase.order - 1);
  const nextPhase = PHASES.find((p) => p.order === currentPhase.order + 1);
  const focusDays = Array.from(
    { length: currentPhase.dayEnd - currentPhase.dayStart + 1 },
    (_, i) => currentPhase.dayStart + i,
  );

  const points = focusDays.map((dayNumber, i) => ({
    dayNumber,
    status: state.statusFor(dayNumber),
    x: nodeX(i),
    y: PAD_Y + i * ROW_H,
  }));
  const roadHeight = PAD_Y * 2 + (focusDays.length - 1) * ROW_H;
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">
            Phase {currentPhase.order} · Days {currentPhase.dayStart}&ndash;{currentPhase.dayEnd}
          </p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            {currentPhase.name}
          </h1>
        </div>
        <Chip tone="accent" className="mt-2 uppercase tracking-wide">
          Day {state.resumeDay}
        </Chip>
      </header>

      {/* Completed phase marker above the road */}
      {prevPhase && (
        <div className="mb-4 flex justify-center">
          <Link href={`/journey/phase/${prevPhase.order}`}>
            <Chip tone="brand" className="gap-1.5 uppercase tracking-wide">
              Phase {prevPhase.order} · {prevPhase.name} <Check size={13} weight="bold" />
            </Chip>
          </Link>
        </div>
      )}

      {/* The road */}
      <div className="relative mx-auto" style={{ width: WIDTH, height: roadHeight }}>
        <svg
          width={WIDTH}
          height={roadHeight}
          className="absolute inset-0"
          aria-hidden
        >
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-line-strong)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray="0.5 11"
          />
        </svg>

        {points.map((p) => {
          const pillLeft = p.x > CENTER_X;
          const circle = <DayCircle day={p.dayNumber} status={p.status} />;
          return (
            <div
              key={p.dayNumber}
              className="absolute flex items-center"
              style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
            >
              {p.status === "today" && pillLeft && (
                <span className="mr-3 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-fg)]">
                  Today
                </span>
              )}
              {p.status === "upcoming" ? (
                circle
              ) : (
                <Link href={`/journey/day/${p.dayNumber}`} aria-label={`Day ${p.dayNumber}`}>
                  {circle}
                </Link>
              )}
              {p.status === "today" && !pillLeft && (
                <span className="ml-3 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-fg)]">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next phase marker below the road */}
      {nextPhase && (
        <div className="mt-6 flex items-center justify-center gap-2.5 text-sm text-[var(--color-ink-muted)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-faint)]">
            <Flag size={16} />
          </span>
          Phase {nextPhase.order} · {nextPhase.name} &mdash; unlocks Day {nextPhase.dayStart}
        </div>
      )}
    </div>
  );
}
