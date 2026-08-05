import { prisma } from "@/lib/prisma";
import { getConfig, phaseForDayIn, getPhases } from "@/lib/config";

/*
  Read-only aggregation for the admin Overview. Computes each onboarded member's
  current program day cheaply from programStartDate + the IST rollover hour
  (mirrors lib/program.ts), then buckets them by day/phase.
*/

const DAY_MS = 86_400_000;
const IST_OFFSET_MS = 330 * 60_000;

function istDayIndex(d: Date, rolloverHour: number): number {
  return Math.floor((d.getTime() + IST_OFFSET_MS - rolloverHour * 3_600_000) / DAY_MS);
}

function currentDay(start: Date | null, programDays: number, rollover: number): number {
  if (!start) return 1;
  const diff = istDayIndex(new Date(), rollover) - istDayIndex(start, rollover);
  return Math.min(programDays, Math.max(1, diff + 1));
}

export type NeedsLookRow = {
  id: string;
  name: string;
  day: number;
  phaseName: string;
  streak: number;
  points: number;
  lastActive: Date;
  reason: string;
  tone: "crisis" | "caution" | "success";
};

export type OverviewMetrics = {
  launched: boolean;
  totalMembers: number;
  newThisWeek: number;
  insidePct: number; // % still within the 60 days
  completedYesterday: number;
  completedYesterdayPct: number | null;
  sosLast24h: number;
  sosUnresolved: number;
  perDay: number[]; // length programDays, counts by current day
  medianDay: number | null;
  phases: { order: number; name: string; dayStart: number; dayEnd: number; count: number }[];
  needsLook: NeedsLookRow[];
  checklist: { label: string; state: "done" | "warn" | "blocker" }[];
};

export async function getOverviewMetrics(): Promise<OverviewMetrics> {
  const config = await getConfig();
  const phases = await getPhases();
  const programDays: number = config.programDays;
  const phaseName = (day: number) => {
    const p = phaseForDayIn(phases, day);
    return `${p.order} · ${p.name}`;
  };

  const members = await prisma.user.findMany({
    where: { onboardedAt: { not: null }, deletedAt: null, staffRole: null },
    select: {
      id: true,
      displayName: true,
      name: true,
      programStartDate: true,
      streakCurrent: true,
      pointsBalance: true,
      plan: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  const total = members.length;
  const weekAgo = new Date(Date.now() - 7 * DAY_MS);
  const dayAgo = new Date(Date.now() - DAY_MS);

  const perDay = new Array<number>(programDays).fill(0);
  let inside = 0;
  const dayValues: number[] = [];
  const dayById = new Map<string, number>();
  for (const m of members) {
    const d = currentDay(m.programStartDate, programDays, config.dayRolloverHour);
    perDay[d - 1] += 1;
    dayById.set(m.id, d);
    dayValues.push(d);
    if (d < programDays || m.plan !== "COMPLETED") inside += 1;
  }
  dayValues.sort((a, b) => a - b);
  const medianDay = dayValues.length ? dayValues[Math.floor(dayValues.length / 2)] : null;

  const [recent, sosLast24h, sosUnresolved, sosRows, failedRows] = await Promise.all([
    prisma.taskCompletion.findMany({
      where: { completedAt: { gte: dayAgo } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.sosEvent.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.sosEvent.count({ where: { reviewedAt: null } }),
    prisma.sosEvent.findMany({
      where: { userId: { not: null }, createdAt: { gte: new Date(Date.now() - 2 * DAY_MS) } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { id: true, displayName: true, name: true, streakCurrent: true, pointsBalance: true, updatedAt: true, programStartDate: true } } },
    }),
    prisma.payment.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { id: true, displayName: true, name: true, streakCurrent: true, pointsBalance: true, updatedAt: true, programStartDate: true } } },
    }),
  ]);

  const completedYesterday = recent.length;
  const completedYesterdayPct = total > 0 ? Math.round((completedYesterday / total) * 100) : null;

  // Needs-a-look: SOS first (highest priority), then failed payments. Dedup by user.
  const seen = new Set<string>();
  const needsLook: NeedsLookRow[] = [];
  const nameOf = (u: { displayName: string | null; name: string | null }) => u.displayName ?? u.name ?? "Member";
  const dayOf = (u: { id: string; programStartDate: Date | null }) =>
    dayById.get(u.id) ?? currentDay(u.programStartDate, programDays, config.dayRolloverHour);

  for (const e of sosRows) {
    if (!e.user || seen.has(e.user.id)) continue;
    seen.add(e.user.id);
    const day = dayOf(e.user);
    needsLook.push({
      id: e.user.id,
      name: nameOf(e.user),
      day,
      phaseName: phaseName(day),
      streak: e.user.streakCurrent,
      points: e.user.pointsBalance,
      lastActive: e.user.updatedAt,
      reason: e.reviewedAt ? "SOS reviewed" : "SOS not yet reviewed",
      tone: e.reviewedAt ? "success" : "crisis",
    });
  }
  for (const p of failedRows) {
    if (!p.user || seen.has(p.user.id)) continue;
    seen.add(p.user.id);
    const day = dayOf(p.user);
    needsLook.push({
      id: p.user.id,
      name: nameOf(p.user),
      day,
      phaseName: phaseName(day),
      streak: p.user.streakCurrent,
      points: p.user.pointsBalance,
      lastActive: p.user.updatedAt,
      reason: "Payment failed",
      tone: "caution",
    });
  }

  // Launch checklist (derived).
  const [dayCount, daysWithTasks, videoTotal, videoReady, helplineCount, rota] = await Promise.all([
    prisma.day.count(),
    prisma.day.count({ where: { tasks: { some: {} } } }),
    prisma.video.count(),
    prisma.video.count({ where: { streamUid: { not: null } } }),
    prisma.helpline.count({ where: { active: true } }),
    prisma.siteConfig.findUnique({ where: { key: "onCallRota" } }),
  ]);

  const checklist: OverviewMetrics["checklist"] = [
    {
      label: `Sixty days authored ${daysWithTasks}/${dayCount}`,
      state: dayCount >= programDays && daysWithTasks >= programDays ? "done" : "warn",
    },
    {
      label: `Videos ready ${videoReady}/${videoTotal}`,
      state: videoTotal > 0 && videoReady === videoTotal ? "done" : "warn",
    },
    {
      label: config.rupeePerPoint ? "Points economy set" : "Points economy — ₹ per point still unset",
      state: config.rupeePerPoint ? "done" : "warn",
    },
    {
      label: helplineCount > 0 ? "Helplines in place" : "No helplines configured",
      state: helplineCount > 0 ? "done" : "blocker",
    },
    {
      label: rota ? "On-call rota set" : "SOS on-call rota is empty — this blocks launch",
      state: rota ? "done" : "blocker",
    },
  ];

  return {
    launched: total > 0,
    totalMembers: total,
    newThisWeek: members.filter((m) => m.createdAt >= weekAgo).length,
    insidePct: total > 0 ? Math.round((inside / total) * 100) : 0,
    completedYesterday,
    completedYesterdayPct,
    sosLast24h,
    sosUnresolved,
    perDay,
    medianDay,
    phases: phases.map((p) => ({
      order: p.order,
      name: p.name,
      dayStart: p.dayStart,
      dayEnd: p.dayEnd,
      count: perDay.slice(p.dayStart - 1, p.dayEnd).reduce((a, b) => a + b, 0),
    })),
    needsLook,
    checklist,
  };
}
