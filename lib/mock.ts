/*
  Mock data layer.
  There is no live database yet, so the app renders against this in-memory demo
  content. It mirrors the Prisma schema shape, so screens read through the
  accessors below (getDemoUser, getDay, getJourney, …) and the source can later
  be swapped from this mock to real Prisma queries without touching the UI.

  Placeholder content is intentionally generic ("Task 1", "Video 1") — real
  content gets uploaded through the admin panel later.
*/

import { PHASES, phaseForDay } from "./config";

export type TaskCategory = "MENTAL" | "PHYSICAL" | "REFLECTION" | "PRACTICE" | "CONNECTION";
export type ResponseType = "NONE" | "WRITTEN" | "TIMER" | "TAP";

export type MockVideo = { id: string; title: string; durationLabel: string };
export type MockTask = {
  id: string;
  order: number;
  title: string;
  category: TaskCategory;
  whyItMatters: string;
  estimatedMinutes: number;
  points: number;
  mandatory: boolean;
  responseType: ResponseType;
  videoCount: number;
};
export type MockDay = {
  dayNumber: number;
  phaseOrder: number;
  phaseName: string;
  title: string;
  isMilestone: boolean;
  videos: MockVideo[]; // day-level "watch first"
  tasks: MockTask[];
};

export type DayStatus = "completed" | "today" | "upcoming" | "locked";

const CATEGORIES: TaskCategory[] = ["REFLECTION", "MENTAL", "PHYSICAL", "PRACTICE", "CONNECTION"];

/** The demo user — stand-in until the real logged-in user + DB are wired. */
export const DEMO_TODAY_DAY = 1;

export const demoUser = {
  id: "demo-user",
  name: "Abhijay",
  displayName: "Abhijay",
  avatarInitial: "A",
  plan: "ACTIVE" as "TRIAL" | "ACTIVE" | "EXPIRED" | "COMPLETED",
  currentDay: DEMO_TODAY_DAY,
  pointsBalance: 0,
  streakCurrent: 1,
  streakLongest: 1,
  whyIStarted: "sample",
  trustedName: "placeholder",
  trustedPhone: "xxxxxxxxxxx",
};

function makeTasks(dayNumber: number): MockTask[] {
  // 3 mandatory ("essentials") + 1-2 optional. Generic placeholder titles.
  const optionalCount = dayNumber % 2 === 0 ? 2 : 1;
  const tasks: MockTask[] = [];
  for (let i = 0; i < 3; i++) {
    tasks.push({
      id: `d${dayNumber}-t${i + 1}`,
      order: i + 1,
      title: `Task ${i + 1}`,
      category: CATEGORIES[(dayNumber + i) % CATEGORIES.length],
      whyItMatters: "Placeholder — the clinician's note for this task goes here.",
      estimatedMinutes: [10, 2, 10][i] ?? 5,
      points: 1,
      mandatory: true,
      responseType: i === 0 ? "WRITTEN" : "NONE",
      videoCount: i === 0 ? 1 : 0,
    });
  }
  for (let j = 0; j < optionalCount; j++) {
    tasks.push({
      id: `d${dayNumber}-o${j + 1}`,
      order: 4 + j,
      title: `Task ${4 + j}`,
      category: CATEGORIES[(dayNumber + j + 3) % CATEGORIES.length],
      whyItMatters: "Placeholder — optional task note goes here.",
      estimatedMinutes: 3,
      points: 1,
      mandatory: false,
      responseType: "NONE",
      videoCount: 0,
    });
  }
  return tasks;
}

function makeVideos(dayNumber: number): MockVideo[] {
  const n = (dayNumber % 3) + 1; // 1-3 day-level videos
  return Array.from({ length: n }, (_, i) => ({
    id: `d${dayNumber}-v${i + 1}`,
    title: `Video ${i + 1}`,
    durationLabel: "0:00",
  }));
}

/** Build a single day. */
export function getDay(dayNumber: number): MockDay {
  const phase = phaseForDay(dayNumber);
  return {
    dayNumber,
    phaseOrder: phase.order,
    phaseName: phase.name,
    title: `Day ${dayNumber}`,
    isMilestone: dayNumber === 60,
    videos: makeVideos(dayNumber),
    tasks: makeTasks(dayNumber),
  };
}

/** Status of a day relative to the demo user's current day. */
export function dayStatus(dayNumber: number, currentDay = DEMO_TODAY_DAY): DayStatus {
  if (dayNumber < currentDay) return "completed";
  if (dayNumber === currentDay) return "today";
  // Next day after today is "upcoming" (preview); the rest are locked-preview too.
  return dayNumber <= currentDay + 0 ? "upcoming" : "upcoming";
}

/** All 60 days for the Journey map, grouped by phase. */
export function getJourney() {
  return PHASES.map((phase) => ({
    ...phase,
    days: Array.from({ length: phase.dayEnd - phase.dayStart + 1 }, (_, i) => {
      const dayNumber = phase.dayStart + i;
      return { dayNumber, status: dayStatus(dayNumber) };
    }),
  }));
}

/** How many mandatory tasks the demo user has completed today (mockups show 0/3). */
export function getTodayProgress() {
  return { done: 0, total: 3, optionalDone: 0 };
}

// ── Helplines (India) — seeded now, admin-editable later ──
export const helplines = [
  { name: "KIRAN", phone: "1800-599-0019", hours: "24×7", languages: "13 languages" },
  { name: "Tele-MANAS", phone: "14416", hours: "24×7", languages: "20+ languages" },
  { name: "iCall", phone: "9152987821", hours: "Mon–Sat, 8am–10pm", languages: "English, Hindi" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345", hours: "24×7", languages: "Multiple" },
  { name: "Women Helpline", phone: "181", hours: "24×7", languages: "Multiple" },
  { name: "Emergency", phone: "112", hours: "24×7", languages: "—" },
];

// ── Rewards (points shop) — pricing is placeholder / configurable ──
export const rewards = [
  {
    id: "r1",
    key: "sleep-stories",
    title: "Guided sleep-story series",
    description: "A calming audio series for the hard nights.",
    pointsCost: 30,
    kind: "DIGITAL" as const,
    featured: true,
    status: "available" as const,
  },
  {
    id: "r2",
    key: "recovery-journal",
    title: "Recovery journal (PDF)",
    description: "A printable companion journal.",
    pointsCost: 20,
    kind: "DIGITAL" as const,
    featured: false,
    status: "redeemed" as const,
  },
  {
    id: "r3",
    key: "merch-discount",
    title: "10% off the merch store",
    description: "A little off anything in the store.",
    pointsCost: 25,
    kind: "DISCOUNT" as const,
    featured: false,
    status: "redeemed" as const,
  },
  {
    id: "r4",
    key: "session-discount",
    title: "25% off a 1:1 session",
    description: "Use it with any specialist you book.",
    pointsCost: 80,
    kind: "DISCOUNT" as const,
    featured: false,
    status: "available" as const,
  },
  {
    id: "r5",
    key: "care-package",
    title: "Care package",
    description: "A physical kit, posted to you.",
    pointsCost: 150,
    kind: "PHYSICAL" as const,
    featured: false,
    status: "available" as const,
  },
];

// ── Badges (12) — earned/locked ──
export const badges = Array.from({ length: 12 }, (_, i) => ({
  id: `b${i + 1}`,
  key: `badge-${i + 1}`,
  name: `Badge ${i + 1}`,
  description: "Placeholder badge description.",
  earned: i < 3,
}));
