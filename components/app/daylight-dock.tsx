import Link from "next/link";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";

/** Floating "Daylight" AI companion entry, bottom-right of the content area. */
export function DaylightDock() {
  return (
    <Link
      href="/daylight"
      className="fixed bottom-6 right-6 z-20 flex items-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-accent-subtle)] py-2.5 pl-2.5 pr-5 shadow-[var(--shadow-float)] transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)]">
        <ChatCircleDots size={22} weight="fill" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-[var(--color-ink)]">Daylight</span>
        <span className="block text-xs text-[var(--color-ink-muted)]">
          AI companion · always awake
        </span>
      </span>
    </Link>
  );
}
