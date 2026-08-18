"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatCircleDots } from "@phosphor-icons/react";

/** Floating "Daylight" AI companion entry, bottom-right of the content area.
 *  Hidden while inside the Daylight chat itself. */
export function DaylightDock() {
  const pathname = usePathname();
  if (pathname?.startsWith("/daylight")) return null;

  return (
    <Link
      href="/daylight"
      aria-label="Daylight — AI companion"
      className="fixed bottom-24 right-5 z-20 flex items-center gap-3 rounded-full bg-[var(--color-accent)] p-3 text-[var(--color-accent-fg)] shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5 lg:bottom-6 lg:right-6 lg:gap-3 lg:rounded-[var(--radius-pill)] lg:border lg:border-[var(--color-line)] lg:bg-[var(--color-accent-subtle)] lg:py-2.5 lg:pl-2.5 lg:pr-5 lg:text-[var(--color-ink)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full lg:bg-[var(--color-accent)] lg:text-[var(--color-accent-fg)]">
        <ChatCircleDots size={22} weight="fill" />
      </span>
      <span className="hidden leading-tight lg:block">
        <span className="block text-sm font-semibold text-[var(--color-ink)]">Daylight</span>
        <span className="block text-xs text-[var(--color-ink-muted)]">
          AI companion · always awake
        </span>
      </span>
    </Link>
  );
}
