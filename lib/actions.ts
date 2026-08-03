"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { currentDay } from "@/lib/program";
import { CONFIG_DEFAULTS } from "@/lib/config";

// ── Onboarding persistence ──────────────────────────────────────────

/** Merge one intake answer into the user's stored intake object. */
export async function saveIntake(step: number, value: string) {
  const user = await requireUser();
  const intake = { ...(user.intake as Record<string, string> | null), [`q${step}`]: value };
  await prisma.user.update({ where: { id: user.id }, data: { intake } });
}

export async function saveConsent(input: {
  storeJournal: boolean;
  storeChat: boolean;
  shareSummaryOnBook: boolean;
  analytics: boolean;
}) {
  const user = await requireUser();
  await prisma.consent.upsert({
    where: { userId: user.id },
    update: input,
    create: { userId: user.id, ...input },
  });
}

export async function saveTrustedContact(name: string, phone: string) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { trustedName: name.trim() || null, trustedPhone: phone.trim() || null },
  });
}

export async function saveWhy(text: string) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { whyIStarted: text.trim() || null },
  });
}

/** Finish onboarding: start the trial and anchor Day 1 to now. */
export async function startTrial() {
  const user = await requireUser();
  if (!user.onboardedAt) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardedAt: new Date(),
        programStartDate: new Date(),
        trialStartedAt: new Date(),
        plan: "TRIAL",
      },
    });
  }
  redirect("/today");
}

// ── Core loop ───────────────────────────────────────────────────────

/** Mark a task complete for the current user, award points, update streak. */
export async function completeTask(taskId: string, response?: string) {
  const user = await requireUser();
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { day: true },
  });
  if (!task) return { ok: false as const, error: "Task not found" };

  const today = currentDay(user);
  if (task.day.dayNumber > today) {
    return { ok: false as const, error: "This day isn't unlocked yet" };
  }

  const existing = await prisma.taskCompletion.findUnique({
    where: { userId_taskId: { userId: user.id, taskId } },
  });
  if (existing) {
    return { ok: true as const, already: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.taskCompletion.create({
      data: { userId: user.id, taskId, response: response ? { text: response } : undefined },
    });
    // Task points.
    await tx.pointsLedger.create({
      data: { userId: user.id, delta: task.points, reason: "TASK", refId: taskId },
    });
    let pointsDelta = task.points;

    // First completion on this program day → count it toward "shown up" streak.
    const dayCompletions = await tx.taskCompletion.count({
      where: { userId: user.id, task: { dayId: task.dayId } },
    });
    let streakBump = 0;
    if (dayCompletions === 1) streakBump = 1;

    // Day-complete bonus once all mandatory tasks in the day are done.
    const mandatory = await tx.task.findMany({
      where: { dayId: task.dayId, mandatory: true },
      select: { id: true },
    });
    const doneMandatory = await tx.taskCompletion.count({
      where: { userId: user.id, taskId: { in: mandatory.map((m) => m.id) } },
    });
    if (mandatory.length > 0 && doneMandatory === mandatory.length) {
      const already = await tx.pointsLedger.findFirst({
        where: { userId: user.id, reason: "DAY_BONUS", refId: String(task.day.dayNumber) },
      });
      if (!already) {
        await tx.pointsLedger.create({
          data: {
            userId: user.id,
            delta: CONFIG_DEFAULTS.dayCompleteBonus,
            reason: "DAY_BONUS",
            refId: String(task.day.dayNumber),
          },
        });
        pointsDelta += CONFIG_DEFAULTS.dayCompleteBonus;
      }
    }

    const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
    const newStreak = fresh.streakCurrent + streakBump;
    await tx.user.update({
      where: { id: user.id },
      data: {
        pointsBalance: { increment: pointsDelta },
        streakCurrent: newStreak,
        streakLongest: Math.max(fresh.streakLongest, newStreak),
        lastCompletedDay: task.day.dayNumber,
      },
    });
  });

  revalidatePath("/today");
  revalidatePath(`/journey/day/${task.day.dayNumber}`);
  revalidatePath("/journey");
  revalidatePath("/progress");
  return { ok: true as const };
}

/** Save a reflection entry for the current user. */
export async function saveReflection(input: { dayNumber?: number; prompt?: string; body: string }) {
  const user = await requireUser();
  const body = input.body.trim();
  if (!body) return { ok: false as const, error: "Nothing to save" };

  await prisma.reflection.create({
    data: {
      userId: user.id,
      dayNumber: input.dayNumber ?? currentDay(user),
      prompt: input.prompt,
      body,
    },
  });
  revalidatePath("/reflections");
  revalidatePath("/progress");
  redirect("/reflections");
}
