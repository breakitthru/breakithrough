/*
  Pure badge definitions — no imports, so both the app (lib/badges.ts) and the
  seed script (which runs under tsx, without path-alias resolution) can use them.
  Names/criteria are seeded into the DB; award logic lives in lib/badges.ts.
*/

export type BadgeCriteria = {
  type: "tasks" | "reflections" | "days" | "full_days" | "day_reached";
  n: number;
};

export const BADGE_DEFS: {
  key: string;
  name: string;
  description: string;
  criteria: BadgeCriteria;
}[] = [
  { key: "badge-1", name: "First step", description: "Complete your first task.", criteria: { type: "tasks", n: 1 } },
  { key: "badge-2", name: "First words", description: "Write your first reflection.", criteria: { type: "reflections", n: 1 } },
  { key: "badge-3", name: "Full day", description: "Finish everything in a single day.", criteria: { type: "full_days", n: 1 } },
  { key: "badge-4", name: "Steady week", description: "Show up seven days.", criteria: { type: "days", n: 7 } },
  { key: "badge-5", name: "Ten done", description: "Complete ten tasks.", criteria: { type: "tasks", n: 10 } },
  { key: "badge-6", name: "Named it", description: "Write three reflections.", criteria: { type: "reflections", n: 3 } },
  { key: "badge-7", name: "Rebuilding", description: "Reach Day 21.", criteria: { type: "day_reached", n: 21 } },
  { key: "badge-8", name: "Two weeks", description: "Show up fourteen days.", criteria: { type: "days", n: 14 } },
  { key: "badge-9", name: "Halfway", description: "Reach Day 30.", criteria: { type: "day_reached", n: 30 } },
  { key: "badge-10", name: "Fifty done", description: "Complete fifty tasks.", criteria: { type: "tasks", n: 50 } },
  { key: "badge-11", name: "Month strong", description: "Show up thirty days.", criteria: { type: "days", n: 30 } },
  { key: "badge-12", name: "Broke it through", description: "Reach Day 60.", criteria: { type: "day_reached", n: 60 } },
];
