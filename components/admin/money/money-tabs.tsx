"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Purchases", href: "/admin/money" },
  { label: "Failed payments", href: "/admin/money/failed" },
  { label: "Points economy", href: "/admin/money/points" },
  { label: "Rewards", href: "/admin/money/rewards" },
  { label: "Promo codes", href: "/admin/money/promos" },
];

export function MoneyTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
      {TABS.map((t) => {
        const active = t.href === "/admin/money" ? pathname === "/admin/money" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors", active ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]")}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
