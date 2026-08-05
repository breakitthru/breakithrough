import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { requireUser } from "@/lib/session";
import { type Permission, roleCan, permissionsFor } from "@/lib/permissions";
import type { StaffRole, User } from "@prisma/client";

/*
  Admin access control. The owner email is hard-coded and is always treated as
  OWNER regardless of the DB row (satisfies "hard-code login IDs" — no seeded
  user needed). Other staff get their role from User.staffRole. Every admin
  section calls requirePermission(...); the layout calls requireStaffRaw().
*/

export const OWNER_EMAILS = ["breakitthru@gmail.com"];

export type AdminUser = User & { effectiveRole: StaffRole };

export function effectiveStaffRole(user: User): StaffRole | null {
  if (user.email && OWNER_EMAILS.includes(user.email.toLowerCase())) return "OWNER";
  return user.staffRole ?? null;
}

/** Signed-in staff member, WITHOUT enforcing 2FA (used by the shell + security pages). */
export async function requireStaffRaw(): Promise<AdminUser> {
  const user = await requireUser();
  const role = effectiveStaffRole(user);
  // No admin-panel permissions at all → treat as a non-admin.
  if (!role || permissionsFor(role).length === 0) redirect("/");
  return Object.assign(user, { effectiveRole: role });
}

/** Signed-in staff member with 2FA enforced. Normal admin pages use this. */
export async function requireStaff(): Promise<AdminUser> {
  const user = await requireStaffRaw();
  if (!user.totpConfirmedAt) redirect("/admin/security/enroll");
  if (!(await isTwoFactorVerified(user.id))) redirect("/admin/security/verify");
  return user;
}

export async function requireOwner(): Promise<AdminUser> {
  const user = await requireStaff();
  if (user.effectiveRole !== "OWNER") redirect("/admin");
  return user;
}

export async function requirePermission(perm: Permission): Promise<AdminUser> {
  const user = await requireStaff();
  if (!roleCan(user.effectiveRole, perm)) redirect("/admin");
  return user;
}

// ── 2FA session marker (short-lived signed cookie, set after TOTP verify) ──

const TWO_FA_COOKIE = "bit_2fa";
const TWO_FA_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(value: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "dev-secret").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function markTwoFactorVerified(userId: string): Promise<void> {
  const exp = Date.now() + TWO_FA_TTL_MS;
  const payload = `${userId}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(TWO_FA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TWO_FA_TTL_MS / 1000,
  });
}

export async function isTwoFactorVerified(userId: string): Promise<boolean> {
  const raw = (await cookies()).get(TWO_FA_COOKIE)?.value;
  if (!raw) return false;
  const [uid, exp, sig] = raw.split(".");
  if (!uid || !exp || !sig) return false;
  if (uid !== userId) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sign(`${uid}.${exp}`), sig);
}

export async function clearTwoFactor(): Promise<void> {
  (await cookies()).delete(TWO_FA_COOKIE);
}
