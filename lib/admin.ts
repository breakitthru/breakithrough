import "server-only";
import { redirect } from "next/navigation";
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

/** True if this user can open the admin panel (owner or a staff role with access). */
export function hasAdminAccess(user: User): boolean {
  const role = effectiveStaffRole(user);
  return !!role && permissionsFor(role).length > 0;
}

/** Signed-in staff member (owner email or a user with a staffRole). */
export async function requireStaffRaw(): Promise<AdminUser> {
  const user = await requireUser();
  const role = effectiveStaffRole(user);
  // No admin-panel permissions at all → treat as a non-admin.
  if (!role || permissionsFor(role).length === 0) redirect("/");
  return Object.assign(user, { effectiveRole: role });
}

export async function requireStaff(): Promise<AdminUser> {
  return requireStaffRaw();
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
