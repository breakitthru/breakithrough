"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getProgramState } from "@/lib/program";
import { awardBadges } from "@/lib/badges";
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

  const state = await getProgramState(user);
  if (task.day.dayNumber > state.unlockedDay) {
    return { ok: false as const, error: "This day isn't unlocked yet" };
  }
  if (!state.isAccessible(task.day.dayNumber)) {
    return { ok: false as const, error: "This day is behind the paywall" };
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

  const newBadges = await awardBadges(user.id);

  revalidatePath("/today");
  revalidatePath(`/journey/day/${task.day.dayNumber}`);
  revalidatePath("/journey");
  revalidatePath("/progress");
  revalidatePath("/notifications");
  return { ok: true as const, newBadges };
}

/** Save a reflection entry for the current user. */
export async function saveReflection(input: { dayNumber?: number; prompt?: string; body: string }) {
  const user = await requireUser();
  const body = input.body.trim();
  if (!body) return { ok: false as const, error: "Nothing to save" };

  const state = await getProgramState(user);
  await prisma.reflection.create({
    data: {
      userId: user.id,
      dayNumber: input.dayNumber ?? state.resumeDay,
      prompt: input.prompt,
      body,
    },
  });
  const newBadges = await awardBadges(user.id);
  revalidatePath("/reflections");
  revalidatePath("/progress");
  revalidatePath("/notifications");
  // Earning a badge sends the user to its celebration; otherwise back to the notebook.
  redirect(newBadges.length ? `/progress/badges/${newBadges[0]}` : "/reflections");
}

/** Save today's mood check-in (0 heavy · 1 flat · 2 okay · 3 lighter). No redirect. */
export async function saveMood(value: number) {
  const user = await requireUser();
  if (!Number.isInteger(value) || value < 0 || value > 3) {
    return { ok: false as const, error: "Invalid mood" };
  }
  const state = await getProgramState(user);
  const dayNumber = state.resumeDay;
  await prisma.moodLog.upsert({
    where: { userId_dayNumber: { userId: user.id, dayNumber } },
    update: { value },
    create: { userId: user.id, dayNumber, value },
  });
  revalidatePath("/today");
  return { ok: true as const, value };
}

// ── Rewards & payments ──────────────────────────────────────────────

/** Redeem a reward: check balance, deduct points atomically, record it. */
export async function redeemReward(rewardId: string) {
  const user = await requireUser();
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || !reward.active) return { ok: false as const, error: "Reward unavailable" };
  if (user.pointsBalance < reward.pointsCost) {
    return { ok: false as const, error: "Not enough points yet" };
  }

  await prisma.$transaction(async (tx) => {
    // Re-check balance inside the transaction to avoid a double-spend race.
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
    if (fresh.pointsBalance < reward.pointsCost) throw new Error("insufficient");
    await tx.redemption.create({
      data: { userId: user.id, rewardId, pointsSpent: reward.pointsCost, status: "REQUESTED" },
    });
    await tx.pointsLedger.create({
      data: { userId: user.id, delta: -reward.pointsCost, reason: "REDEMPTION", refId: rewardId },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { pointsBalance: { decrement: reward.pointsCost } },
    });
  });

  revalidatePath("/progress");
  revalidatePath("/progress/rewards");
  return { ok: true as const, key: reward.key };
}

/**
 * Placeholder payment. Marks the account paid so the paywall flow is testable
 * end to end. MUST be replaced by verified Razorpay payment before launch.
 */
export async function completePaymentStub() {
  const user = await requireUser();
  if (user.plan !== "ACTIVE" && user.plan !== "COMPLETED") {
    const config = await getConfigInline();
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { plan: "ACTIVE", paidAt: new Date() } }),
      prisma.payment.create({
        data: { userId: user.id, amountInr: config.programPriceInr, status: "PAID" },
      }),
    ]);
  }
  revalidatePath("/today");
  redirect("/checkout/confirmed");
}

async function getConfigInline() {
  const { getConfig } = await import("@/lib/config");
  return getConfig();
}
