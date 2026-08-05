"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flag } from "@phosphor-icons/react";
import type { DayStatus } from "@/lib/program";

/*
  The full 60-day road. Nodes wander left/right down the page and a smooth dotted
  path threads their centres. It scrolls the whole program; the sticky header and
  the sticky bottom bar both update to whichever phase is currently in view.
*/
const WIDTH = 560;
const CENTER_X = WIDTH / 2;
const AMP = 140;
const ROW_H = 96;
const FREQ = 0.46; // gentler wave so the trail flows instead of zig-zagging
const PAD_Y = 60;
const PHASE_GAP = 72; // extra breathing room + room for the phase marker
const TRAIL = "#a99e86";

function nodeX(i: number) {
  return CENTER_X + Math.sin((i + 0.6) * FREQ) * AMP;
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
      <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
        <span className="node-ripple" />
        <span className="node-ripple [animation-delay:0.93s]" />
        <span className="node-ripple [animation-delay:1.86s]" />
        <div
          className={`${base} relative h-[4.5rem] w-[4.5rem] bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-xl shadow-[var(--shadow-card)]`}
        >
          {day}
        </div>
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

type Day = { day: number; status: DayStatus; phaseOrder: number };
type Phase = { order: number; name: string; dayStart: number; dayEnd: number };

export function JourneyRoad({
  days,
  phases,
  resumeDay,
  currentPhaseOrder,
}: {
  days: Day[];
  phases: Phase[];
  resumeDay: number;
  currentPhaseOrder: number;
}) {
  const [active, setActive] = useState(currentPhaseOrder);
  const markRefs = useRef<Record<number, HTMLElement | null>>({});

  // Scrollspy: the active phase is the last one whose marker has crossed a line
  // ~30% down the viewport.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      let next = phases[0]?.order ?? 1;
      for (const p of phases) {
        const el = markRefs.current[p.order];
        if (el && el.getBoundingClientRect().top <= line) next = p.order;
      }
      setActive(next);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [phases]);

  // Node positions, with an extra gap wherever a new phase begins.
  let y = PAD_Y;
  const nodes = days.map((d, i) => {
    if (i > 0) {
      y += ROW_H;
      if (d.phaseOrder !== days[i - 1].phaseOrder) y += PHASE_GAP;
    }
    return { ...d, x: nodeX(i), y };
  });
  const roadHeight = (nodes[nodes.length - 1]?.y ?? PAD_Y) + PAD_Y;
  const pathD = smoothPath(nodes);

  const firstYByPhase: Record<number, number> = {};
  for (const n of nodes) {
    if (firstYByPhase[n.phaseOrder] === undefined) firstYByPhase[n.phaseOrder] = n.y;
  }

  const activePhase = phases.find((p) => p.order === active) ?? phases[0];

  return (
    <div className="mx-auto max-w-[760px]">
      {/* Sticky header — its phase marking updates as you scroll */}
      <header className="sticky top-0 z-20 -mx-10 mb-2 flex items-start justify-between gap-4 bg-[var(--color-canvas)]/95 px-10 pb-4 pt-2 backdrop-blur">
        <div>
          <p className="eyebrow text-[var(--color-accent)]">
            Phase {activePhase.order} · Days {activePhase.dayStart}&ndash;{activePhase.dayEnd}
          </p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            {activePhase.name}
          </h1>
        </div>
        <span className="mt-2 shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent-subtle-ink)]">
          Day {resumeDay}
        </span>
      </header>

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

        {/* Phase markings along the road (also the scrollspy sentinels) */}
        {phases.map((p) => {
          const fy = firstYByPhase[p.order];
          if (fy === undefined) return null;
          const my =
            p.order === phases[0].order ? fy - 42 : fy - (ROW_H + PHASE_GAP) / 2;
          const isActive = p.order === active;
          return (
            <div
              key={`mark-${p.order}`}
              ref={(el) => {
                markRefs.current[p.order] = el;
              }}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ top: my }}
            >
              <span
                className={`inline-flex items-center whitespace-nowrap rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] shadow-[var(--shadow-card)] ${
                  isActive
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent-subtle-ink)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
                }`}
              >
                Phase {p.order} · {p.name}
              </span>
            </div>
          );
        })}

        {nodes.map((p) => {
          const pillLeft = p.x > CENTER_X;
          const circle = <DayCircle day={p.day} status={p.status} />;
          return (
            <div
              key={p.day}
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
                <Link href={`/journey/day/${p.day}`} aria-label={`Day ${p.day}`}>
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

      {/* Sticky bottom bar — reflects the phase you're currently looking at */}
      <div className="sticky bottom-4 z-20 mt-6 flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] py-2 pl-2 pr-5 shadow-[var(--shadow-card)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
            <Flag size={16} weight="fill" />
          </span>
          <span className="text-sm text-[var(--color-ink)]">
            <span className="font-semibold">
              Phase {activePhase.order} of {phases.length} · {activePhase.name}
            </span>
            <span className="text-[var(--color-ink-muted)]">
              {" "}
              · Days {activePhase.dayStart}&ndash;{activePhase.dayEnd}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
