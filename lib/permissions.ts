import type { StaffRole } from "@prisma/client";

/*
  RBAC permission model for the admin panel. Each admin section checks a
  permission key; roles map to a set of keys. OWNER has everything. The
  permission matrix on the Staff page is rendered from ROLE_PERMISSIONS.
*/

export const PERMISSIONS = [
  "overview.view",
  "program.edit",
  "videos.edit",
  "members.view",
  "members.delete",
  "safety.view",
  "safety.act",
  "money.view",
  "money.act",
  "rewards.act",
  "notify.send",
  "staff.manage",
  "settings.edit",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

// Human labels for the permission matrix.
export const PERMISSION_LABELS: Record<Permission, string> = {
  "overview.view": "See the overview",
  "program.edit": "Author the program",
  "videos.edit": "Manage the video library",
  "members.view": "See members",
  "members.delete": "Delete a member (DPDP)",
  "safety.view": "See the SOS log",
  "safety.act": "Act on SOS events",
  "money.view": "See money",
  "money.act": "Refund / act on payments",
  "rewards.act": "Fulfil redemptions & edit rewards",
  "notify.send": "Send member notifications",
  "staff.manage": "Manage staff & roles",
  "settings.edit": "Change settings",
  "audit.view": "Read the audit log",
};

export const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  OWNER: ALL,
  OPS: [
    "overview.view",
    "members.view",
    "safety.view",
    "safety.act",
    "money.view",
    "money.act",
    "rewards.act",
    "notify.send",
    "audit.view",
  ],
  CLINICIAN: ["overview.view", "program.edit", "videos.edit", "members.view", "safety.view"],
  MODERATOR: ["overview.view", "members.view", "safety.view", "safety.act"],
  // Specialist has no admin-panel access (their console is a separate, future area).
  SPECIALIST: [],
};

export function permissionsFor(role: StaffRole | null | undefined): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Does this effective role grant the permission? */
export function roleCan(role: StaffRole | null | undefined, perm: Permission): boolean {
  return permissionsFor(role).includes(perm);
}
