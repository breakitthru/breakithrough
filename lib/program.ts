import { prisma } from "@/lib/prisma";
import { CONFIG_DEFAULTS, phaseForDay, PHASES } from "@/lib/config";
import type { User } from "@prisma/client";

/*
  Per-user program logic, DB-backed. Program content (days/tasks/videos) is read
  from the database (seeded); per-user state (which day they're on, completions,
  points) comes from the user's own rows. A brand-new onboarded user starts on
  Day 1 with nothing completed.
*/

export type DayStatus = "completed" | "today" | "upcoming" | "locked";

const DAY_MS = 86_400_000;

/** The user's current program day (1..programDays). Day-locking: day n unlocks
 *  at programStartDate + (n-1) days. */
export function currentDay(user: Pick<User, "programStartDate">): number {
  if (!user.programStartDate) return 1;
  const elapsed = Math.floor((Date.now() - user.programStartDate.getTime()) / DAY_MS);
  return Math.min(CONFIG_DEFAULTS.programDays, Math.max(1, elapsed + 1));
}

/** Status of a day relative to the user's current day. */
export function dayStatus(dayNumber: number, today: number): DayStatus {
  if (dayNumber < today) return "completed";
  if (dayNumber === today) return "today";
  return "upcoming";
}

/** All 60 days grouped by phase, with each day's status for this user. */
export function getJourney(today: number) {
  return PHASES.map((phase) => ({
    ...phase,
    days: Array.from({ length: phase.dayEnd - phase.dayStart + 1 }, (_, i) => {
      const dayNumber = phase.dayStart + i;
      return { dayNumber, status: dayStatus(dayNumber, today) };
    }),
  }));
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

/** Full content + this user's completion state for a given day. Returns null if
 *  the day hasn't been seeded into the DB yet. */
export async function getDayView(
  userId: string,
  dayNumber: number,
): Promise<DayView | null> {
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
  const phase = phaseForDay(dayNumber);

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
      durationLabel: v.durationSec ? `${Math.floor(v.durationSec / 60)}:${String(v.durationSec % 60).padStart(2, "0")}` : "0:00",
    })),
    tasks,
    progress: {
      done: mandatory.filter((t) => t.completed).length,
      total: mandatory.length,
      optionalDone: optional.filter((t) => t.completed).length,
    },
  };
}

/** Reflection count for the stats tiles. */
export async function reflectionCount(userId: string): Promise<number> {
  return prisma.reflection.count({ where: { userId } });
}
