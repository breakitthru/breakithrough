"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "The 60 days", href: "/admin/program" },
  { label: "Videos", href: "/admin/program/videos" },
  { label: "Phases & badges", href: "/admin/program/phases" },
  { label: "Rules", href: "/admin/program/rules" },
  { label: "Intake", href: "/admin/program/intake" },
];

export function ProgramTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
      {TABS.map((t) => {
        const active = t.href === "/admin/program" ? pathname === t.href || pathname.startsWith("/admin/program/day") : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors",
              active
                ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
