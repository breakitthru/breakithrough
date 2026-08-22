"use client";

/*
  Lightweight, dependency-free SVG charts for the Mood & Anxiety tracker.
  Responsive via viewBox; colours come from the shared mood-tracker helpers.
  Kept intentionally simple — no external charting library, which also keeps the
  page within the site's Content-Security-Policy.
*/

const AXIS = "#c7cdbb";
const GRID = "#e6e9df";
const TEXT = "#5c6259";

type Series = {
  values: number[];
  color: string;
  pointColors?: string[];
  label?: string;
  fill?: boolean;
};

function niceLabels(labels: string[], max: number): string[] {
  // Show at most ~8 x-axis labels so they don't overlap.
  const step = Math.ceil(labels.length / Math.min(labels.length, max));
  return labels.map((l, i) => (i % step === 0 || i === labels.length - 1 ? l.slice(5) : ""));
}

export function TrendLine({
  labels,
  series,
  min,
  max,
  height = 220,
}: {
  labels: string[];
  series: Series[];
  min: number;
  max: number;
  height?: number;
}) {
  const W = 720;
  const H = height;
  const padL = 30;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const n = labels.length;

  const x = (i: number) => (n <= 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * plotH;

  const yTicks: number[] = [];
  for (let v = min; v <= max; v++) yTicks.push(v);

  const xLabels = niceLabels(labels, 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trend chart" style={{ maxWidth: "100%" }}>
      {/* gridlines + y ticks */}
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
          <text x={padL - 6} y={y(v) + 3} textAnchor="end" fontSize={9} fill={TEXT}>{v}</text>
        </g>
      ))}
      {/* x labels */}
      {xLabels.map((l, i) =>
        l ? (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={8.5} fill={TEXT}>{l}</text>
        ) : null,
      )}
      {/* series */}
      {series.map((s, si) => {
        const path = s.values
          .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
          .join(" ");
        const area =
          s.fill && n > 0
            ? `${path} L ${x(n - 1).toFixed(1)} ${y(min).toFixed(1)} L ${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`
            : "";
        return (
          <g key={si}>
            {area && <path d={area} fill={s.color} opacity={0.08} />}
            <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <circle
                key={i}
                cx={x(i)}
                cy={y(v)}
                r={n > 40 ? 2 : 3.5}
                fill={s.pointColors ? s.pointColors[i] : s.color}
                stroke="#fff"
                strokeWidth={n > 40 ? 0 : 1}
              />
            ))}
          </g>
        );
      })}
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke={AXIS} strokeWidth={1} />
    </svg>
  );
}

export function Sparkline({ values, min, max }: { values: number[]; min: number; max: number }) {
  const W = 320;
  const H = 70;
  const pad = 6;
  const n = values.length;
  if (n === 0) {
    return (
      <div className="flex h-[70px] items-center justify-center text-xs text-[var(--color-ink-faint)]">
        No entries yet
      </div>
    );
  }
  const x = (i: number) => (n <= 1 ? W / 2 : pad + (i / (n - 1)) * (W - pad * 2));
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="14-day trend" style={{ maxWidth: "100%" }}>
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke={GRID} strokeWidth={1} strokeDasharray="3 3" />
      <path d={path} fill="none" stroke="#3e6e64" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={2.5} fill="#3e6e64" />
      ))}
    </svg>
  );
}

/** Horizontal bars (used for trigger counts). */
export function HBars({ items }: { items: { label: string; value: number; color?: string }[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--color-ink-muted)]">No triggers logged yet.</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);
  const rowH = 30;
  const W = 720;
  const H = items.length * rowH + 10;
  const padL = 110;
  const barW = W - padL - 40;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Trigger frequency" style={{ maxWidth: "100%" }}>
      {items.map((it, i) => {
        const w = (it.value / max) * barW;
        const yy = i * rowH + 6;
        return (
          <g key={it.label}>
            <text x={padL - 8} y={yy + 14} textAnchor="end" fontSize={11} fill={TEXT}>
              {it.label.length > 16 ? it.label.slice(0, 15) + "…" : it.label}
            </text>
            <rect x={padL} y={yy} width={Math.max(w, 2)} height={18} rx={5} fill={it.color ?? "#3e6e64"} />
            <text x={padL + Math.max(w, 2) + 6} y={yy + 14} fontSize={10.5} fill={TEXT}>{it.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Vertical bars with per-bar colours (used for the mood distribution). */
export function VBars({ items }: { items: { label: string; value: number; color: string }[] }) {
  const W = 720;
  const H = 200;
  const padB = 24;
  const padT = 10;
  const max = Math.max(...items.map((i) => i.value), 1);
  const gap = 8;
  const barW = (W - gap * (items.length + 1)) / items.length;
  const plotH = H - padB - padT;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mood distribution" style={{ maxWidth: "100%" }}>
      {items.map((it, i) => {
        const h = (it.value / max) * plotH;
        const xx = gap + i * (barW + gap);
        const yy = padT + (plotH - h);
        return (
          <g key={it.label}>
            <rect x={xx} y={yy} width={barW} height={h} rx={5} fill={it.color} />
            {it.value > 0 && (
              <text x={xx + barW / 2} y={yy - 4} textAnchor="middle" fontSize={9.5} fill={TEXT}>{it.value}</text>
            )}
            <text x={xx + barW / 2} y={H - 8} textAnchor="middle" fontSize={9.5} fill={TEXT}>{it.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
