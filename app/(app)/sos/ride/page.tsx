import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { demoUser } from "@/lib/mock";

// Ride-out: breathing pacer + urge timer + "why I started" read back.
// The animated pacer/timer is built in a later pass; this is the static shell.
export default function RideOutPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[560px] flex-col items-center justify-center text-center">
      <Link
        href="/sos"
        className="mb-8 inline-flex items-center gap-1.5 self-start text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> SOS
      </Link>

      {/* Breathing pacer placeholder */}
      <div className="relative flex h-52 w-52 items-center justify-center">
        <span className="absolute h-52 w-52 rounded-full bg-[var(--color-brand-subtle)]" />
        <span className="absolute h-36 w-36 rounded-full bg-[var(--color-accent-subtle)]" />
        <span className="relative text-sm font-medium text-[var(--color-ink-muted)]">Breathe in…</span>
      </div>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
        Why you started
      </p>
      <p className="mt-2 font-display text-xl leading-snug text-[var(--color-ink)]">
        &ldquo;{demoUser.whyIStarted}&rdquo;
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/breathe"
          className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]"
        >
          Two minutes of breathing
        </Link>
        <a
          href={`tel:${demoUser.trustedPhone?.replace(/[^0-9]/g, "")}`}
          className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-6 py-3 font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
        >
          Call {demoUser.trustedName}
        </a>
      </div>
    </div>
  );
}
