"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Workspace & brand", href: "/admin/settings" },
  { label: "Design", href: "/admin/settings/design" },
  { label: "Notifications", href: "/admin/settings/notifications" },
  { label: "Shop & delivery", href: "/admin/settings/shop" },
  { label: "Integrations", href: "/admin/settings/integrations" },
  { label: "Legal & policies", href: "/admin/settings/legal" },
  { label: "Data export", href: "/admin/settings/data" },
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
      {TABS.map((t) => {
        const active = t.href === "/admin/settings" ? pathname === "/admin/settings" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors", active ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
