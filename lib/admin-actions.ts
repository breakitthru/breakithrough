"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaffRaw, markTwoFactorVerified } from "@/lib/admin";
import { generateTotpSecret, verifyTotp } from "@/lib/totp";
import { logAudit } from "@/lib/audit";

/*
  Admin server actions. Security (2FA) actions live here; section-specific
  mutations are added in their own files as phases land. Every mutating action
  authorises first, then writes an audit entry.
*/

/** Ensure the staff member has a TOTP secret to enroll against; returns it (base32). */
export async function ensureTotpSecret(): Promise<string> {
  const user = await requireStaffRaw();
  if (user.totpSecret && !user.totpConfirmedAt) return user.totpSecret;
  if (user.totpConfirmedAt && user.totpSecret) return user.totpSecret;
  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });
  return secret;
}

/** Confirm enrollment: verify the first code, then mark 2FA active + verified. */
export async function confirmTotpEnrollment(code: string): Promise<{ ok: false; error: string }> {
  const user = await requireStaffRaw();
  if (!user.totpSecret) return { ok: false, error: "Start again — no secret found." };
  if (!verifyTotp(user.totpSecret, code)) return { ok: false, error: "That code didn't match. Try the current one." };
  await prisma.user.update({ where: { id: user.id }, data: { totpConfirmedAt: new Date() } });
  await markTwoFactorVerified(user.id);
  await logAudit({
    actorId: user.id,
    actorEmail: user.email,
    action: "staff.2fa.enroll",
    targetType: "User",
    targetId: user.id,
    summary: "Enrolled two-factor authentication",
  });
  redirect("/admin");
}

/** Verify a code for this session (already enrolled). */
export async function verifyTotpCode(code: string): Promise<{ ok: false; error: string }> {
  const user = await requireStaffRaw();
  if (!user.totpSecret || !user.totpConfirmedAt) redirect("/admin/security/enroll");
  if (!verifyTotp(user.totpSecret, code)) return { ok: false, error: "That code didn't match. Try the current one." };
  await markTwoFactorVerified(user.id);
  redirect("/admin");
}
