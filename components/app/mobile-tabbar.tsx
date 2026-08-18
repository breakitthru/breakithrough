"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Path, Notebook, Lifebuoy } from "@phosphor-icons/react";
import { MOBILE_TABS } from "./nav-items";
import { cn } from "@/lib/utils";

/*
  Floating bottom tab bar for phones. Hidden at lg+ (the sidebar takes over).
  Mirrors the mockups: a dark evergreen pill, the active icon inside a white
  circle, SOS in the clay accent and Profile shown as the avatar initial.
  Kept in sync with the desktop nav via MOBILE_TABS in nav-items.ts.
*/
const ICONS = {
  today: House,
  journey: Path,
  reflections: Notebook,
  sos: Lifebuoy,
} as const;

export function MobileTabbar({ avatarInitial }: { avatarInitial: string }) {
  const pathname = usePathname();
  // Highlight the tapped tab immediately, before the next page finishes loading.
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => setPending(null), [pathname]);
  const current = pending ?? pathname;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      aria-label="Primary"
    >
      <div className="flex w-full max-w-sm items-center justify-between rounded-[var(--radius-pill)] bg-[var(--color-brand-ink)] px-3 py-2.5 text-[var(--color-brand-fg)] shadow-[var(--shadow-float)]">
        {MOBILE_TABS.map((item) => {
          const active =
            current === item.href || current.startsWith(item.href + "/");
          const Icon = item.icon === "profile" ? null : ICONS[item.icon];

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setPending(item.href)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="flex items-center justify-center"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  active
                    ? "bg-white text-[var(--color-brand-ink)]"
                    : item.icon === "sos"
                      ? "text-[var(--color-accent)]"
                      : item.icon === "profile"
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                        : "text-white/70",
                )}
              >
                {Icon ? (
                  <Icon size={22} weight={active ? "fill" : "regular"} />
                ) : (
                  avatarInitial
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
