import Link from "next/link";
import { Check, Flag } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { getProgramState, type DayStatus } from "@/lib/program";
import { phaseForDay, PHASES } from "@/lib/config";

// Serpentine road geometry. Nodes wander left/right down the page; a smooth
// dotted SVG path threads through their centres and the opaque nodes sit on top,
// so the dots only show in the gaps — matching the "road" mockup (D25).
const WIDTH = 560;
const CENTER_X = WIDTH / 2;
const AMP = 168;
const ROW_H = 76;
const PAD_Y = 48;
const TRAIL = "#a99e86"; // warm taupe, darker than the hairline tokens

function nodeX(i: number) {
  return CENTER_X + Math.sin((i + 0.6) * 0.8) * AMP;
}

// Catmull-Rom through the node centres → cubic beziers, for a soft curvy trail.
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function DayCircle({ day, status }: { day: number; status: DayStatus }) {
  const base = "flex items-center justify-center rounded-full font-medium transition-colors";
  if (status === "today") {
    return (
      <div
        className={`${base} h-[4.5rem] w-[4.5rem] bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-xl shadow-[var(--shadow-card)] ring-2 ring-[var(--color-accent)] ring-offset-[5px] ring-offset-[var(--color-canvas)]`}
      >
        {day}
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className={`${base} h-14 w-14 bg-[var(--color-brand-ink)] text-white text-[0.95rem]`}>
        {day}
      </div>
    );
  }
  if (status === "available") {
    return (
      <div
        className={`${base} h-14 w-14 border-2 border-[var(--color-accent)] bg-[var(--color-surface)] text-[var(--color-accent-subtle-ink)] text-[0.95rem]`}
      >
        {day}
      </div>
    );
  }
  return (
    <div
      className={`${base} h-14 w-14 border border-[var(--color-line-strong)] bg-[var(--color-surface)] text-[var(--color-ink-faint)] text-[0.95rem]`}
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
  const pathD = smoothPath(points);

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
        <div className="mb-3 flex justify-center">
          <Link href={`/journey/phase/${prevPhase.order}`}>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-brand)] shadow-[var(--shadow-card)]">
              Phase {prevPhase.order} · {prevPhase.name}
              <Check size={13} weight="bold" className="text-[var(--color-success)]" />
            </span>
          </Link>
        </div>
      )}

      {/* The road */}
      <div className="relative mx-auto" style={{ width: WIDTH, height: roadHeight }}>
        <svg width={WIDTH} height={roadHeight} className="absolute inset-0" aria-hidden>
          <path
            d={pathD}
            fill="none"
            stroke={TRAIL}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="0.5 10"
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
                <span className="mr-3 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-fg)] shadow-[var(--shadow-card)]">
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
                <span className="ml-3 rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-fg)] shadow-[var(--shadow-card)]">
                  Today
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Next phase marker below the road */}
      {nextPhase && (
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] py-2 pl-2 pr-5 shadow-[var(--shadow-card)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
              <Flag size={16} />
            </span>
            <span className="text-sm text-[var(--color-ink-muted)]">
              Phase {nextPhase.order} · {nextPhase.name} &mdash; unlocks Day {nextPhase.dayStart}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
