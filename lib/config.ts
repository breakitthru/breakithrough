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
  daylightSystemPrompt:
    "You are Daylight, a warm, steady companion inside Break It Thru, a 60-day program for getting through a breakup. You are an AI, not a person, and not a therapist or a crisis service. Talk like a kind, grounded friend who listens more than they lecture. Keep replies short and human (usually 2 to 5 sentences). Validate feelings without clichés or toxic positivity. Ask gentle, open questions. Never diagnose, never give medical or legal advice, and don't push the person to contact their ex. If the person mentions self-harm, suicide, wanting to disappear, or being in danger, respond with calm care and clearly encourage them to use the app's SOS button or contact a local helpline or emergency services right now, and stay with them supportively. You cannot see their tasks or data unless they tell you.", // Daylight AI companion system prompt (admin-editable)
  logoUrl: "" as string, // admin-uploaded brand logo (data URL); empty = show the placeholder box
  logoSize: 40 as number, // rendered logo height in px
  rupeePerPoint: null as number | null, // UNSET by design — blocks reward pricing until the client decides
  dayRolloverHour: 0, // midnight; day boundary in IST
  timezone: "Asia/Kolkata",
  currency: "INR",
  // Shop shipping (physical goods)
  shippingFeeInr: 0, // flat delivery fee added at checkout; 0 = free shipping
  freeShippingThresholdInr: 0, // subtotal at/above which shipping is waived; 0 = no threshold
  // GST / tax invoice (physical goods). Prices are treated as GST-inclusive.
  // GST is shown on invoices when gstRatePct > 0 and a GSTIN is set.
  gstin: "" as string, // the business GSTIN printed on invoices
  gstRatePct: 0 as number, // GST rate used to back-out tax from the inclusive price (e.g. 5, 12, 18)
  businessName: "Break It Thru" as string, // seller name on invoices
  businessAddress: "" as string, // seller address block on invoices
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
    // The AI key is a secret — read it only via getAiSettings() in lib/ai.ts,
    // never through the app config that flows into client components.
    delete (overrides as Record<string, unknown>).aiApiKey;
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
