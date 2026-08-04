import Link from "next/link";
import { Sparkle, PaperPlaneRight, LockSimple, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/card";

// Daylight chat — first-chat / empty state (D71). The AI backend is intentionally
// NOT wired yet (provider/model TBD with the client), so there is no message
// history: a fresh account opens to Daylight's greeting + a few suggested openers.
const OPENERS = ["I can't sleep", "I nearly texted him", "Just checking in"];

export default function DaylightPage() {
  return (
    <div className="daylight-reveal mx-auto flex h-[calc(100dvh-5rem)] max-w-[820px] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-4">
        <Link
          href="/today"
          aria-label="Back to your dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={18} />
        </Link>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-ink)] text-white">
          <Sparkle size={22} weight="fill" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl text-[var(--color-ink)]">Daylight</h1>
            <Chip tone="brand">AI</Chip>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)]">AI companion · always awake</p>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 py-4 text-center text-xs text-[var(--color-ink-faint)]">
        <LockSimple size={13} /> Private to you · AI, not a person · SOS if unsafe
      </p>

      {/* First-chat: greeting + suggested openers, no history */}
      <div className="flex flex-1 flex-col justify-center px-1">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
          Today
        </p>
        <div className="flex justify-start">
          <div className="max-w-[75%] rounded-[var(--radius-lg)] rounded-bl-sm border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)]">
            <p>I&rsquo;m Daylight. Not a person — but I&rsquo;m awake whenever you are.</p>
            <p className="mt-3">
              Start anywhere: how today went, or whatever&rsquo;s sitting on your chest.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {OPENERS.map((o) => (
            <button
              key={o}
              className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Composer (disabled — AI not wired yet) */}
      <div className="mt-4 flex items-center gap-3">
        <input
          disabled
          placeholder="Type anything…"
          className="h-12 flex-1 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] disabled:opacity-70"
        />
        <button
          disabled
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] disabled:opacity-60"
          aria-label="Send"
        >
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </div>
    </div>
  );
}
