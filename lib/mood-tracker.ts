/*
  Shared, framework-agnostic pieces for the Mood & Anxiety tracker: the scale
  definitions, the default triggers, and the colour helpers. Pure functions only
  (no server or client imports) so both the server actions and the client UI can
  use them. Ported from the client's worksheet tool.
*/

export type MoodEntry = {
  date: string; // YYYY-MM-DD
  mood: number; // -5..5
  intensity: number; // 0..5
  frequency: number; // 0..5
  triggers: string[];
  notes: string;
};

export const MOOD_LEVELS: { v: number; label: string }[] = [
  { v: 5, label: "Euphoric" },
  { v: 4, label: "Excited" },
  { v: 3, label: "Very Good" },
  { v: 2, label: "Good" },
  { v: 1, label: "Fair" },
  { v: 0, label: "Neutral" },
  { v: -1, label: "Not good" },
  { v: -2, label: "Sad" },
  { v: -3, label: "Very sad" },
  { v: -4, label: "Melancholic" },
  { v: -5, label: "Suicidal" },
];

export const ANX_LEVELS: { v: number; label: string }[] = [
  { v: 0, label: "None" },
  { v: 1, label: "Mild" },
  { v: 2, label: "Moderate" },
  { v: 3, label: "Severe" },
  { v: 4, label: "Extreme" },
  { v: 5, label: "Dissociation" },
];

export const FREQ_LEVELS: { v: number; label: string }[] = [
  { v: 0, label: "None" },
  { v: 1, label: "Sometimes" },
  { v: 2, label: "Half the time" },
  { v: 3, label: "> Half the time" },
  { v: 4, label: "All the time" },
  { v: 5, label: "Episodes/day" },
];

export const DEFAULT_TRIGGERS = ["Work", "Sleep", "Social", "Health", "Finances"];

export const MOOD_MIN = -5;
export const MOOD_MAX = 5;
export const ANX_MIN = 0;
export const ANX_MAX = 5;

/** Blend two hex colours; t in [0,1]. Returns an rgb() string. */
export function lerpColor(a: string, b: string, t: number): string {
  const ah = a.replace("#", "");
  const bh = b.replace("#", "");
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(ar + (br - ar) * clamped);
  const g = Math.round(ag + (bg - ag) * clamped);
  const bl = Math.round(ab + (bb - ab) * clamped);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Mood colour: negative -> cool blue, 0 -> neutral, positive -> warm amber. */
export function moodColor(v: number): string {
  if (v >= 0) return lerpColor("#b7bdae", "#c8963f", v / 5);
  return lerpColor("#b7bdae", "#5b7db1", -v / 5);
}

/** Anxiety colour: none -> soft, extreme -> danger red. */
export function anxColor(v: number): string {
  return lerpColor("#dfe3d8", "#b6543f", v / 5);
}

export function moodLabel(v: number): string {
  return MOOD_LEVELS.find((l) => l.v === v)?.label ?? String(v);
}

/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function localDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Basic YYYY-MM-DD shape/validity check. */
export function isValidDateStr(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00");
  return !Number.isNaN(d.getTime()) && localDateStr(d) === s;
}
