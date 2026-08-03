// Primary navigation destinations for the authenticated member app.
// Shared so the sidebar (desktop) and a future mobile tab bar stay in sync.

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: "today" | "journey" | "reflections";
};

export const NAV_ITEMS: NavItem[] = [
  { key: "today", label: "Today", href: "/today", icon: "today" },
  { key: "journey", label: "Journey", href: "/journey", icon: "journey" },
  { key: "reflections", label: "Reflections", href: "/reflections", icon: "reflections" },
];
