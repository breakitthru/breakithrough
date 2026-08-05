import type { Permission } from "@/lib/permissions";

/*
  Admin sidebar structure. Items are gated by a permission; "comingSoon" items
  (Sessions, Community, Daylight) render disabled — those product areas aren't
  built yet. Icon names map to Phosphor icons in admin-sidebar.tsx.
*/

export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
  comingSoon?: boolean;
};

export type AdminNavGroup = {
  label?: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    items: [{ key: "overview", label: "Overview", href: "/admin", icon: "overview", permission: "overview.view" }],
  },
  {
    label: "Program",
    items: [
      { key: "program", label: "Program", href: "/admin/program", icon: "program", permission: "program.edit" },
      { key: "daylight", label: "Daylight", href: "/admin/daylight", icon: "daylight", comingSoon: true },
    ],
  },
  {
    label: "Members",
    items: [
      { key: "members", label: "Members", href: "/admin/members", icon: "members", permission: "members.view" },
      { key: "safety", label: "Safety", href: "/admin/safety", icon: "safety", permission: "safety.view" },
      { key: "community", label: "Community", href: "/admin/community", icon: "community", comingSoon: true },
    ],
  },
  {
    label: "Business",
    items: [
      { key: "sessions", label: "Sessions", href: "/admin/sessions", icon: "sessions", comingSoon: true },
      { key: "money", label: "Money", href: "/admin/money", icon: "money", permission: "money.view" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "staff", label: "Staff", href: "/admin/staff", icon: "staff", permission: "staff.manage" },
      { key: "settings", label: "Settings", href: "/admin/settings", icon: "settings", permission: "settings.edit" },
    ],
  },
];
