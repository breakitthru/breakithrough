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
  rupeePerPoint: null as number | null, // UNSET by design — blocks reward pricing until the client decides
  dayRolloverHour: 0, // midnight; day boundary in IST
  timezone: "Asia/Kolkata",
  currency: "INR",
} as const;

export type AppConfig = typeof CONFIG_DEFAULTS;

/**
 * Returns merged config. For now returns defaults (no live DB); later this reads
 * SiteConfig rows and merges them over the defaults so admin edits take effect.
 */
export async function getConfig(): Promise<AppConfig> {
  // TODO: when DB + admin land, merge SiteConfig overrides here.
  return CONFIG_DEFAULTS;
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
