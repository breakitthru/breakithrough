"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { isValidDateStr, type MoodEntry } from "@/lib/mood-tracker";

/*
  Mood & Anxiety tracker mutations. Each entry is private to the member (never
  surfaced in admin, like reflections). Every action is fully wrapped so it
  always resolves to a result and never rejects — a rejected server action would
  crash the client with an unhandled error.
*/

type SaveResult = { ok: true; entry: MoodEntry } | { ok: false; error: string };
type DeleteResult = { ok: true } | { ok: false; error: string };

const entrySchema = z.object({
  date: z.string().refine(isValidDateStr, "Please choose a valid date."),
  mood: z.coerce.number().int().min(-5).max(5),
  intensity: z.coerce.number().int().min(0).max(5),
  frequency: z.coerce.number().int().min(0).max(5),
  triggers: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
  notes: z.string().max(4000).default(""),
});

export async function saveMoodEntry(input: unknown): Promise<SaveResult> {
  try {
    const user = await requireUser();
    const parsed = entrySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the entry and try again." };
    }
    const data = parsed.data;
    // De-duplicate triggers while preserving order.
    const triggers = [...new Set(data.triggers)];

    const saved = await prisma.moodEntry.upsert({
      where: { userId_date: { userId: user.id, date: data.date } },
      update: { mood: data.mood, intensity: data.intensity, frequency: data.frequency, triggers, notes: data.notes },
      create: { userId: user.id, date: data.date, mood: data.mood, intensity: data.intensity, frequency: data.frequency, triggers, notes: data.notes },
    });

    revalidatePath("/mood-tracker");
    return {
      ok: true,
      entry: {
        date: saved.date,
        mood: saved.mood,
        intensity: saved.intensity,
        frequency: saved.frequency,
        triggers: saved.triggers,
        notes: saved.notes,
      },
    };
  } catch (e) {
    if (e && typeof (e as { digest?: unknown }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_")) throw e;
    return { ok: false, error: "Could not save your entry right now. Please try again." };
  }
}

export async function deleteMoodEntry(date: string): Promise<DeleteResult> {
  try {
    const user = await requireUser();
    if (!isValidDateStr(date)) return { ok: false, error: "Invalid date." };
    await prisma.moodEntry.deleteMany({ where: { userId: user.id, date } });
    revalidatePath("/mood-tracker");
    return { ok: true };
  } catch (e) {
    if (e && typeof (e as { digest?: unknown }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_")) throw e;
    return { ok: false, error: "Could not delete that entry right now. Please try again." };
  }
}
