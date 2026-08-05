"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, OWNER_EMAILS } from "@/lib/admin";
import { requireUser } from "@/lib/session";
import { logAudit } from "@/lib/audit";
import type { StaffRole } from "@prisma/client";

type Result = { ok: true } | { ok: false; error: string };
const ROLES: StaffRole[] = ["OWNER", "OPS", "CLINICIAN", "MODERATOR", "SPECIALIST"];

/** Create an invite and return an accept link (email delivery is not wired). */
export async function createInvite(
  email: string,
  role: StaffRole,
): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  const admin = await requirePermission("staff.manage");
  const clean = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { ok: false, error: "Enter a valid email" };
  if (!ROLES.includes(role)) return { ok: false, error: "Pick a role" };

  const token = randomUUID().replace(/-/g, "");
  await prisma.staffInvite.create({
    data: { email: clean, staffRole: role, token, invitedById: admin.id, expiresAt: new Date(Date.now() + 7 * 86_400_000) },
  });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "staff.invite", targetType: "StaffInvite", targetId: clean, summary: `Invited ${clean} as ${role}` });
  const base = process.env.AUTH_URL ?? "";
  return { ok: true, link: `${base}/accept-invite/${token}` };
}

/** Change a staff member's role, or suspend them (role = null). */
export async function setStaffRole(userId: string, role: StaffRole | null): Promise<Result> {
  const admin = await requirePermission("staff.manage");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user) return { ok: false, error: "User not found" };
  if (user.email && OWNER_EMAILS.includes(user.email.toLowerCase())) {
    return { ok: false, error: "The owner account can't be changed here." };
  }
  if (role && !ROLES.includes(role)) return { ok: false, error: "Invalid role" };
  await prisma.user.update({ where: { id: userId }, data: { staffRole: role } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: role ? "staff.role" : "staff.suspend", targetType: "User", targetId: userId, summary: role ? `Set role to ${role}` : "Suspended staff access" });
  revalidatePath("/admin/staff");
  return { ok: true };
}

/** Accept an invite: the signed-in user (matching the invited email) becomes staff. */
export async function acceptInvite(token: string): Promise<Result> {
  const user = await requireUser();
  const invite = await prisma.staffInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt) return { ok: false, error: "This invite is no longer valid." };
  if (invite.expiresAt < new Date()) return { ok: false, error: "This invite has expired." };
  if (!user.email || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return { ok: false, error: `Sign in as ${invite.email} to accept this invite.` };
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { staffRole: invite.staffRole } }),
    prisma.staffInvite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);
  await logAudit({ actorId: user.id, actorEmail: user.email, action: "staff.accept", targetType: "User", targetId: user.id, summary: `Accepted staff invite as ${invite.staffRole}` });
  return { ok: true };
}
