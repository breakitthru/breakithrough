// Primary navigation destinations for the authenticated member app.
// Shared so the sidebar (desktop) and a future mobile tab bar stay in sync.

export type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: "today" | "journey" | "reflections" | "shop";
};

export const NAV_ITEMS: NavItem[] = [
  { key: "today", label: "Today", href: "/today", icon: "today" },
  { key: "journey", label: "Journey", href: "/journey", icon: "journey" },
  { key: "reflections", label: "Reflections", href: "/reflections", icon: "reflections" },
  { key: "shop", label: "Shop", href: "/shop", icon: "shop" },
];

// Bottom tab bar for phones. Deliberately different from NAV_ITEMS: it surfaces
// SOS and Profile (the two things you reach for on a phone) and drops Shop
// (reached from Progress). "sos" and "profile" are rendered specially in the
// tab bar — SOS in the accent colour, Profile as the avatar initial.
export type MobileTab = {
  key: string;
  label: string;
  href: string;
  icon: "today" | "journey" | "reflections" | "sos" | "profile";
};

export const MOBILE_TABS: MobileTab[] = [
  { key: "today", label: "Today", href: "/today", icon: "today" },
  { key: "journey", label: "Journey", href: "/journey", icon: "journey" },
  { key: "reflections", label: "Reflections", href: "/reflections", icon: "reflections" },
  { key: "sos", label: "SOS", href: "/sos", icon: "sos" },
  { key: "profile", label: "Profile", href: "/profile", icon: "profile" },
];
