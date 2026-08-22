import { requireOnboardedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MoodTracker } from "@/components/app/mood-tracker/mood-tracker";
import type { MoodEntry } from "@/lib/mood-tracker";

export default async function MoodTrackerPage() {
  const user = await requireOnboardedUser();
  const rows = await prisma.moodEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    select: { date: true, mood: true, intensity: true, frequency: true, triggers: true, notes: true },
  });

  const entries: MoodEntry[] = rows.map((r) => ({
    date: r.date,
    mood: r.mood,
    intensity: r.intensity,
    frequency: r.frequency,
    triggers: r.triggers,
    notes: r.notes,
  }));

  return <MoodTracker initialEntries={entries} />;
}
