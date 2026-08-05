"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/admin";
import { logAudit } from "@/lib/audit";

type Result = { ok: true } | { ok: false; error: string };

const PLANS = ["TRIAL", "ACTIVE", "EXPIRED", "COMPLETED"] as const;
type Plan = (typeof PLANS)[number];

export async function setMemberPlan(userId: string, plan: Plan): Promise<Result> {
  const admin = await requirePermission("members.view");
  if (!PLANS.includes(plan)) return { ok: false, error: "Invalid plan" };
  await prisma.user.update({ where: { id: userId }, data: { plan } });
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "member.plan", targetType: "User", targetId: userId, summary: `Set plan to ${plan}`, meta: { plan } });
  revalidatePath(`/admin/members/${userId}`);
  revalidatePath("/admin/members");
  return { ok: true };
}

async function uniquePseudoId(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const id = `M-${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.deletedAccount.findUnique({ where: { pseudoId: id } });
    if (!exists) return id;
  }
  return `M-${Date.now().toString().slice(-6)}`;
}

/*
  DPDP erasure. Anonymises the account (nulls all PII), erases private content
  (reflections, chat, moods), retains payment/ledger rows for legal/tax, and
  writes a pseudonymous tombstone. No name survives on the record.
*/
export async function deleteMemberDpdp(userId: string, note?: string): Promise<Result> {
  const admin = await requirePermission("members.delete");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true, staffRole: true, _count: { select: { payments: true } } },
  });
  if (!user) return { ok: false, error: "Member not found" };
  if (user.staffRole) return { ok: false, error: "Staff accounts are managed under Staff." };
  if (user.deletedAt) return { ok: false, error: "This account is already erased." };

  const pseudoId = await uniquePseudoId();
  await prisma.$transaction([
    prisma.reflection.deleteMany({ where: { userId } }),
    prisma.chatMessage.deleteMany({ where: { userId } }),
    prisma.moodLog.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        email: null,
        name: null,
        displayName: null,
        image: null,
        avatarKey: null,
        password: null,
        whyIStarted: null,
        trustedName: null,
        trustedPhone: null,
        intake: Prisma.JsonNull,
        deletedAt: new Date(),
      },
    }),
    prisma.deletedAccount.create({
      data: {
        pseudoId,
        deletedById: admin.id,
        retentionReasons: ["payment records", "audit trail"],
        paymentsRetained: user._count.payments,
        note: note || null,
      },
    }),
  ]);
  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "member.delete", targetType: "User", targetId: userId, summary: `Erased an account (DPDP) → ${pseudoId}`, meta: { pseudoId } });
  revalidatePath("/admin/members");
  return { ok: true };
}
