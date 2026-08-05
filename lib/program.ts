import { prisma } from "@/lib/prisma";
import { getConfig, phaseForDayIn, getPhases } from "@/lib/config";
import type { User } from "@prisma/client";

/*
  Per-user program logic, DB-backed.

  Day-locking uses IST + the configurable day-rollover hour: day n unlocks at
  programStartDate + (n-1) rollover boundaries. A day counts as "completed" only
  when all of its mandatory tasks are done — missed days are NOT auto-completed;
  the user resumes at the lowest incomplete unlocked day.
*/

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000; // UTC+5:30

function istDayIndex(d: Date, rolloverHour: number): number {
  return Math.floor((d.getTime() + IST_OFFSET_MS - rolloverHour * 3_600_000) / DAY_MS);
}

export type DayStatus = "completed" | "today" | "available" | "upcoming";

export type ProgramState = {
  unlockedDay: number; // highest day reachable by the calendar
  resumeDay: number; // active day = lowest unlocked day not yet completed
  programDays: number;
  trialDays: number;
  paid: boolean;
  completed: Set<number>;
  statusFor: (n: number) => DayStatus;
  /** Paywall gate: trial days are always open; later days need a paid plan. */
  isAccessible: (n: number) => boolean;
  /** True when the user's resume day sits behind the paywall. */
  walled: boolean;
};

export async function getProgramState(user: User): Promise<ProgramState> {
  const config = await getConfig();
  const programDays = config.programDays;
  const trialDays = config.trialDays;
  const paid = user.plan === "ACTIVE" || user.plan === "COMPLETED";

  let unlockedDay = 1;
  if (user.programStartDate) {
    const diff =
      istDayIndex(new Date(), config.dayRolloverHour) -
      istDayIndex(user.programStartDate, config.dayRolloverHour);
    unlockedDay = Math.min(programDays, Math.max(1, diff + 1));
  }

  // Mandatory task ids per day + this user's completions.
  const days = await prisma.day.findMany({
    select: { dayNumber: true, tasks: { where: { mandatory: true }, select: { id: true } } },
  });
  const comps = await prisma.taskCompletion.findMany({
    where: { userId: user.id },
    select: { taskId: true },
  });
  const doneSet = new Set(comps.map((c) => c.taskId));

  const completed = new Set<number>();
  for (const d of days) {
    const ids = d.tasks.map((t) => t.id);
    if (ids.length > 0 && ids.every((id) => doneSet.has(id))) completed.add(d.dayNumber);
  }

  let resumeDay = unlockedDay;
  for (let d = 1; d <= unlockedDay; d++) {
    if (!completed.has(d)) {
      resumeDay = d;
      break;
    }
  }

  const isAccessible = (n: number) => n <= trialDays || paid;
  const statusFor = (n: number): DayStatus => {
    // The real calendar day stays "today" (clay) until the next day unlocks,
    // even after all its tasks are done — the orange marker never regresses.
    if (n === unlockedDay) return "today";
    if (n > unlockedDay) return "upcoming";
    if (completed.has(n)) return "completed";
    return "available"; // a past, unlocked day the user hasn't finished
  };

  return {
    unlockedDay,
    resumeDay,
    programDays,
    trialDays,
    paid,
    completed,
    statusFor,
    isAccessible,
    walled: !isAccessible(resumeDay),
  };
}

export type TaskView = {
  id: string;
  order: number;
  title: string;
  category: string;
  whyItMatters: string | null;
  estimatedMinutes: number;
  points: number;
  mandatory: boolean;
  responseType: string;
  videoCount: number;
  completed: boolean;
};

export type DayView = {
  dayNumber: number;
  phaseOrder: number;
  phaseName: string;
  title: string;
  isMilestone: boolean;
  videos: { id: string; title: string; durationLabel: string }[];
  tasks: TaskView[];
  progress: { done: number; total: number; optionalDone: number };
};

/** Full content + this user's completion state for a given day. */
export async function getDayView(userId: string, dayNumber: number): Promise<DayView | null> {
  const day = await prisma.day.findUnique({
    where: { dayNumber },
    include: {
      tasks: { orderBy: { order: "asc" }, include: { videos: true } },
      videos: { where: { taskId: null }, orderBy: { order: "asc" } },
    },
  });
  if (!day) return null;

  const completions = await prisma.taskCompletion.findMany({
    where: { userId, task: { dayId: day.id } },
    select: { taskId: true },
  });
  const done = new Set(completions.map((c) => c.taskId));
  const phase = phaseForDayIn(await getPhases(), dayNumber);

  const tasks: TaskView[] = day.tasks.map((t) => ({
    id: t.id,
    order: t.order,
    title: t.title,
    category: t.category,
    whyItMatters: t.whyItMatters,
    estimatedMinutes: t.estimatedMinutes,
    points: t.points,
    mandatory: t.mandatory,
    responseType: t.responseType,
    videoCount: t.videos.length,
    completed: done.has(t.id),
  }));

  const mandatory = tasks.filter((t) => t.mandatory);
  const optional = tasks.filter((t) => !t.mandatory);

  return {
    dayNumber,
    phaseOrder: phase.order,
    phaseName: phase.name,
    title: day.title ?? `Day ${dayNumber}`,
    isMilestone: day.isMilestone,
    videos: day.videos.map((v) => ({
      id: v.id,
      title: v.title,
      durationLabel: v.durationSec
        ? `${Math.floor(v.durationSec / 60)}:${String(v.durationSec % 60).padStart(2, "0")}`
        : "0:00",
    })),
    tasks,
    progress: {
      done: mandatory.filter((t) => t.completed).length,
      total: mandatory.length,
      optionalDone: optional.filter((t) => t.completed).length,
    },
  };
}

export async function reflectionCount(userId: string): Promise<number> {
  return prisma.reflection.count({ where: { userId } });
}

// ── DB-backed catalogs (admin-editable) ─────────────────────────────

// Fallback helplines so SOS never fails even if the DB is unreachable.
const HELPLINE_FALLBACK = [
  { name: "KIRAN", phone: "1800-599-0019", hours: "24×7", languages: "13 languages" },
  { name: "Tele-MANAS", phone: "14416", hours: "24×7", languages: "20+ languages" },
  { name: "iCall", phone: "9152987821", hours: "Mon–Sat, 8am–10pm", languages: "English, Hindi" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345", hours: "24×7", languages: "Multiple" },
  { name: "Women Helpline", phone: "181", hours: "24×7", languages: "Multiple" },
  { name: "Emergency", phone: "112", hours: "24×7", languages: "—" },
];

export async function getHelplines() {
  try {
    const rows = await prisma.helpline.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    if (rows.length === 0) return HELPLINE_FALLBACK;
    return rows.map((h) => ({
      name: h.name,
      phone: h.phone,
      hours: h.hours ?? "24×7",
      languages: h.languages ?? "—",
    }));
  } catch {
    return HELPLINE_FALLBACK;
  }
}

export async function getRewards() {
  return prisma.reward.findMany({ where: { active: true }, orderBy: { order: "asc" } });
}

export async function getBadgesWithEarned(userId: string) {
  const [defs, earned] = await Promise.all([
    prisma.badge.findMany({ orderBy: { order: "asc" } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const earnedSet = new Set(earned.map((e) => e.badgeId));
  return defs.map((b) => ({ ...b, earned: earnedSet.has(b.id) }));
}

export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  order: number;
  earned: boolean;
  earnedAt: Date | null;
  /** Progress toward the criterion, capped at the target. */
  current: number;
  target: number;
};

type Crit = { type: "tasks" | "reflections" | "days" | "full_days" | "day_reached"; n: number };

/** Every badge with this user's earned state, timestamp, and progress-to-unlock. */
export async function getAchievements(user: User): Promise<Achievement[]> {
  const [tasks, reflections, state, defs, earned] = await Promise.all([
    prisma.taskCompletion.count({ where: { userId: user.id } }),
    prisma.reflection.count({ where: { userId: user.id } }),
    getProgramState(user),
    prisma.badge.findMany({ orderBy: { order: "asc" } }),
    prisma.userBadge.findMany({ where: { userId: user.id } }),
  ]);

  const stats: Record<Crit["type"], number> = {
    tasks,
    reflections,
    days: user.streakCurrent,
    full_days: state.completed.size,
    day_reached: state.unlockedDay,
  };
  const earnedById = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  return defs.map((b) => {
    const crit = (b.criteria as Crit | null) ?? null;
    const target = crit?.n ?? 0;
    const raw = crit ? (stats[crit.type] ?? 0) : 0;
    return {
      id: b.id,
      key: b.key,
      name: b.name,
      description: b.description,
      order: b.order,
      earned: earnedById.has(b.id),
      earnedAt: earnedById.get(b.id) ?? null,
      current: Math.min(raw, target),
      target,
    };
  });
}

/** A single badge for the detail/celebration screen. */
export async function getAchievement(user: User, key: string): Promise<Achievement | null> {
  const all = await getAchievements(user);
  return all.find((a) => a.key === key) ?? null;
}
