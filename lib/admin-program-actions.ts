"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { createDirectUpload, getStreamStatus, deleteStreamVideo, isStreamConfigured } from "@/lib/cloudflare-stream";

/*
  Program authoring mutations (direct-edit live). Each authorises, writes, logs
  an audit entry, then revalidates the member surfaces so edits show immediately.
*/

const CATEGORIES = ["MENTAL", "PHYSICAL", "REFLECTION", "PRACTICE", "CONNECTION"] as const;
const RESPONSE_TYPES = ["NONE", "WRITTEN", "TIMER", "TAP"] as const;

function revalidateProgram(dayNumber?: number) {
  revalidatePath("/admin/program");
  revalidatePath("/today");
  revalidatePath("/journey");
  if (dayNumber) {
    revalidatePath(`/admin/program/day/${dayNumber}`);
    revalidatePath(`/journey/day/${dayNumber}`);
  }
}

const taskSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(160),
  category: z.enum(CATEGORIES),
  responseType: z.enum(RESPONSE_TYPES),
  estimatedMinutes: z.coerce.number().int().min(0).max(240),
  points: z.coerce.number().int().min(0).max(50),
  mandatory: z.coerce.boolean(),
  hasVideo: z.coerce.boolean(),
  whyItMatters: z.string().trim().max(1000).optional().nullable(),
  steps: z.array(z.string().trim().min(1).max(300)).max(20).optional().default([]),
});

// Loose input shapes (the client holds plain strings/numbers; schemas validate at runtime).
export type TaskInput = {
  title: string;
  category: string;
  responseType: string;
  estimatedMinutes: number | string;
  points: number | string;
  mandatory: boolean;
  hasVideo: boolean;
  whyItMatters?: string | null;
  steps?: string[];
};
export type VideoInput = {
  title: string;
  dayNumber: number | string;
  taskId?: string | null;
  streamUid?: string | null;
  durationSec?: number | string | null;
};
export type PhaseInput = { name: string; dayStart: number | string; dayEnd: number | string };
export type BadgeInput = {
  key: string;
  name: string;
  description: string;
  critType: string;
  critN: number | string;
  order: number | string;
};
type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTask(dayNumber: number, input: TaskInput): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid task" };

  const day = await prisma.day.findUnique({ where: { dayNumber }, select: { id: true } });
  if (!day) return { ok: false, error: "Day not found" };
  const count = await prisma.task.count({ where: { dayId: day.id } });
  const task = await prisma.task.create({
    data: { dayId: day.id, order: count, ...parsed.data, whyItMatters: parsed.data.whyItMatters || null },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "task.create", targetType: "Task", targetId: task.id, summary: `Added a task to Day ${dayNumber}`, meta: { title: parsed.data.title } });
  revalidateProgram(dayNumber);
  return { ok: true };
}

export async function updateTask(taskId: string, input: TaskInput): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid task" };
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { ...parsed.data, whyItMatters: parsed.data.whyItMatters || null },
    include: { day: { select: { dayNumber: true } } },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "task.update", targetType: "Task", targetId: taskId, summary: `Edited a task on Day ${task.day.dayNumber}`, meta: { title: parsed.data.title } });
  revalidateProgram(task.day.dayNumber);
  return { ok: true };
}

export async function deleteTask(taskId: string): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { day: { select: { dayNumber: true } } } });
  if (!task) return { ok: false, error: "Task not found" };
  await prisma.task.delete({ where: { id: taskId } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "task.delete", targetType: "Task", targetId: taskId, summary: `Removed a task from Day ${task.day.dayNumber}`, meta: { title: task.title } });
  revalidateProgram(task.day.dayNumber);
  return { ok: true };
}

/** Move a task up or down within its day (swaps order with the neighbour). */
export async function moveTask(taskId: string, dir: "up" | "down"): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { day: { select: { id: true, dayNumber: true } } } });
  if (!task) return { ok: false, error: "Task not found" };
  const siblings = await prisma.task.findMany({ where: { dayId: task.day.id }, orderBy: { order: "asc" } });
  const idx = siblings.findIndex((t) => t.id === taskId);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { ok: true };
  const other = siblings[swapIdx];
  await prisma.$transaction([
    prisma.task.update({ where: { id: task.id }, data: { order: other.order } }),
    prisma.task.update({ where: { id: other.id }, data: { order: task.order } }),
  ]);
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "task.reorder", targetType: "Task", targetId: taskId, summary: `Reordered tasks on Day ${task.day.dayNumber}` });
  revalidateProgram(task.day.dayNumber);
  return { ok: true };
}

const daySchema = z.object({
  title: z.string().trim().max(120).optional().nullable(),
  isMilestone: z.coerce.boolean(),
});

export async function updateDay(dayNumber: number, input: z.input<typeof daySchema>): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = daySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid day" };
  await prisma.day.update({ where: { dayNumber }, data: { title: parsed.data.title || null, isMilestone: parsed.data.isMilestone } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "day.update", targetType: "Day", targetId: String(dayNumber), summary: `Updated Day ${dayNumber}` });
  revalidateProgram(dayNumber);
  return { ok: true };
}

// ── Videos ──────────────────────────────────────────────────────────

const videoSchema = z.object({
  title: z.string().trim().min(1, "A title is required").max(160),
  dayNumber: z.coerce.number().int().min(1).max(60),
  taskId: z.string().optional().nullable(),
  streamUid: z.string().trim().max(120).optional().nullable(),
  durationSec: z.coerce.number().int().min(0).max(36000).optional().nullable(),
});

/**
 * Mint a one-time Cloudflare Stream upload URL. The browser uploads the file
 * straight to Cloudflare and gets back the `uid`, which is saved via createVideo.
 */
export async function startVideoUpload(
  name?: string,
): Promise<{ ok: true; uploadURL: string; uid: string } | { ok: false; error: string }> {
  await requirePermission("videos.edit");
  if (!isStreamConfigured) {
    return { ok: false, error: "Video hosting isn't connected yet. Add the Cloudflare account id and Stream API token in the environment, then redeploy." };
  }
  try {
    const up = await createDirectUpload({ name });
    return { ok: true, uploadURL: up.uploadURL, uid: up.uid };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not start the upload" };
  }
}

/** Re-check a clip's transcode status on Cloudflare and record its duration once ready. */
export async function refreshVideoStatus(id: string): Promise<ActionResult> {
  const admin = await requirePermission("videos.edit");
  const v = await prisma.video.findUnique({ where: { id }, include: { day: { select: { dayNumber: true } } } });
  if (!v) return { ok: false, error: "Video not found" };
  if (!v.streamUid) return { ok: false, error: "Nothing uploaded to check yet" };
  const status = await getStreamStatus(v.streamUid);
  if (!status) return { ok: false, error: "Could not reach Cloudflare Stream" };
  await prisma.video.update({
    where: { id },
    data: {
      // duration is only recorded once the clip is playable, so its presence doubles as the "Ready" flag
      durationSec: status.readyToStream && status.durationSec ? status.durationSec : v.durationSec,
      posterKey: status.thumbnail ?? v.posterKey,
    },
  });
  void admin;
  revalidateProgram(v.day.dayNumber);
  revalidatePath("/admin/program/videos");
  return { ok: true };
}

export async function createVideo(input: VideoInput): Promise<ActionResult> {
  const admin = await requirePermission("videos.edit");
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid video" };
  const day = await prisma.day.findUnique({ where: { dayNumber: parsed.data.dayNumber }, select: { id: true } });
  if (!day) return { ok: false, error: "Day not found" };
  const v = await prisma.video.create({
    data: {
      dayId: day.id,
      taskId: parsed.data.taskId || null,
      title: parsed.data.title,
      streamUid: parsed.data.streamUid || null,
      durationSec: parsed.data.durationSec || null,
    },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "video.create", targetType: "Video", targetId: v.id, summary: `Added video "${parsed.data.title}"` });
  revalidateProgram(parsed.data.dayNumber);
  revalidatePath("/admin/program/videos");
  return { ok: true };
}

export async function updateVideo(id: string, input: VideoInput): Promise<ActionResult> {
  const admin = await requirePermission("videos.edit");
  const parsed = videoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid video" };
  await prisma.video.update({
    where: { id },
    data: { title: parsed.data.title, streamUid: parsed.data.streamUid || null, durationSec: parsed.data.durationSec || null, taskId: parsed.data.taskId || null },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "video.update", targetType: "Video", targetId: id, summary: `Edited video "${parsed.data.title}"` });
  revalidateProgram(parsed.data.dayNumber);
  revalidatePath("/admin/program/videos");
  return { ok: true };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  const admin = await requirePermission("videos.edit");
  const v = await prisma.video.findUnique({ where: { id }, include: { day: { select: { dayNumber: true } } } });
  if (!v) return { ok: false, error: "Video not found" };
  if (v.streamUid) await deleteStreamVideo(v.streamUid);
  await prisma.video.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "video.delete", targetType: "Video", targetId: id, summary: `Deleted video "${v.title}"` });
  revalidateProgram(v.day.dayNumber);
  revalidatePath("/admin/program/videos");
  return { ok: true };
}

// ── Phases (DB-backed; member surfaces read these too) ──────────────

const phaseSchema = z.object({
  name: z.string().trim().min(1).max(80),
  dayStart: z.coerce.number().int().min(1).max(60),
  dayEnd: z.coerce.number().int().min(1).max(60),
});

export async function updatePhase(order: number, input: PhaseInput): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = phaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid phase" };
  if (parsed.data.dayEnd < parsed.data.dayStart) return { ok: false, error: "End day is before the start day" };
  await prisma.phase.update({ where: { order }, data: parsed.data });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "phase.update", targetType: "Phase", targetId: String(order), summary: `Edited phase ${order} (${parsed.data.name})` });
  revalidateProgram();
  revalidatePath("/admin/program/phases");
  return { ok: true };
}

// ── Badges ──────────────────────────────────────────────────────────

const CRIT_TYPES = ["tasks", "reflections", "days", "full_days", "day_reached"] as const;
const badgeSchema = z.object({
  key: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(240),
  critType: z.enum(CRIT_TYPES),
  critN: z.coerce.number().int().min(1).max(1000),
  order: z.coerce.number().int().min(0).max(1000),
});

export async function createBadge(input: BadgeInput): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = badgeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid badge" };
  const exists = await prisma.badge.findUnique({ where: { key: parsed.data.key } });
  if (exists) return { ok: false, error: "A badge with that key already exists" };
  const b = await prisma.badge.create({
    data: { key: parsed.data.key, name: parsed.data.name, description: parsed.data.description, order: parsed.data.order, criteria: { type: parsed.data.critType, n: parsed.data.critN } },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "badge.create", targetType: "Badge", targetId: b.id, summary: `Added badge "${parsed.data.name}"` });
  revalidatePath("/admin/program/phases");
  revalidatePath("/progress/badges");
  return { ok: true };
}

export async function updateBadge(id: string, input: BadgeInput): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const parsed = badgeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid badge" };
  await prisma.badge.update({
    where: { id },
    data: { key: parsed.data.key, name: parsed.data.name, description: parsed.data.description, order: parsed.data.order, criteria: { type: parsed.data.critType, n: parsed.data.critN } },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "badge.update", targetType: "Badge", targetId: id, summary: `Edited badge "${parsed.data.name}"` });
  revalidatePath("/admin/program/phases");
  revalidatePath("/progress/badges");
  return { ok: true };
}

export async function deleteBadge(id: string): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  const b = await prisma.badge.findUnique({ where: { id } });
  if (!b) return { ok: false, error: "Badge not found" };
  await prisma.badge.delete({ where: { id } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "badge.delete", targetType: "Badge", targetId: id, summary: `Deleted badge "${b.name}"` });
  revalidatePath("/admin/program/phases");
  revalidatePath("/progress/badges");
  return { ok: true };
}

// ── Config (Rules, points, etc.) + Intake questions ─────────────────

export async function setConfigValue(key: string, value: unknown): Promise<ActionResult> {
  const admin = await requirePermission("program.edit");
  await prisma.siteConfig.upsert({ where: { key }, update: { value: value as never }, create: { key, value: value as never } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "config.set", targetType: "SiteConfig", targetId: key, summary: `Set ${key}`, meta: { value: value as never } });
  revalidatePath("/admin/program/rules");
  revalidatePath("/today");
  revalidatePath("/journey");
  revalidatePath("/reflections/new");
  return { ok: true };
}
