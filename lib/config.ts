/*
  Tunables. Every configurable value the admin panel will eventually own lives
  here as a typed default. At runtime these can be overridden by SiteConfig rows
  (getConfig() merges DB values over these defaults). Never hardcode these
  numbers in components — read them from getConfig().
*/

export const CONFIG_DEFAULTS = {
  programDays: 60,
  trialDays: 4, // program days 1-4 are the free trial; wall appears on day 5
  programPriceInr: 999, // one-time
  pointsPerTask: 1, // mandatory & optional both award this by default
  dayCompleteBonus: 1, // all mandatory tasks in a day
  sosRideOutPoints: 1, // max 1/day
  reflectionPoints: 1, // max 1/day
  reflectionPrompt: "What's one thing you noticed today?", // daily journaling prompt shown to members
  rupeePerPoint: null as number | null, // UNSET by design — blocks reward pricing until the client decides
  dayRolloverHour: 0, // midnight; day boundary in IST
  timezone: "Asia/Kolkata",
  currency: "INR",
} as const;

export type AppConfig = typeof CONFIG_DEFAULTS;

/**
 * Merged config: SiteConfig rows (admin-editable) layered over the defaults.
 * Falls back to defaults if the DB is unreachable, so pages never hard-fail on it.
 */
export async function getConfig(): Promise<AppConfig> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.siteConfig.findMany();
    const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...CONFIG_DEFAULTS, ...overrides } as AppConfig;
  } catch {
    return CONFIG_DEFAULTS;
  }
}

/** The four fixed phases, harvested from the shipped design. Do not rename. */
export const PHASES = [
  { order: 1, name: "Steady breath", dayStart: 1, dayEnd: 8 },
  { order: 2, name: "Feeling the feelings", dayStart: 9, dayEnd: 20 },
  { order: 3, name: "Rebuilding", dayStart: 21, dayEnd: 45 },
  { order: 4, name: "Integration", dayStart: 46, dayEnd: 60 },
] as const;

export function phaseForDay(day: number) {
  return PHASES.find((p) => day >= p.dayStart && day <= p.dayEnd) ?? PHASES[0];
}

export type PhaseDef = { order: number; name: string; dayStart: number; dayEnd: number };

/**
 * Phases from the DB Phase table (admin-editable), falling back to the constant
 * above if the table is empty or unreachable. Member surfaces read this so
 * admin phase edits (names / day ranges) take effect.
 */
export async function getPhases(): Promise<PhaseDef[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const rows = await prisma.phase.findMany({ orderBy: { order: "asc" } });
    if (rows.length > 0) {
      return rows.map((r) => ({ order: r.order, name: r.name, dayStart: r.dayStart, dayEnd: r.dayEnd }));
    }
  } catch {
    // fall through to the constant
  }
  return PHASES.map((p) => ({ ...p }));
}

export function phaseForDayIn(phases: PhaseDef[], day: number): PhaseDef {
  return phases.find((p) => day >= p.dayStart && day <= p.dayEnd) ?? phases[0];
}
