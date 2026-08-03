import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/session";

// Ride-out: breathing + urge timer + "why I started" read back (if signed in).
export default async function RideOutPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <Link
        href="/sos"
        className="mb-8 inline-flex items-center gap-1.5 self-start text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> SOS
      </Link>

      <div className="relative flex h-52 w-52 items-center justify-center">
        <span className="absolute h-52 w-52 rounded-full bg-[var(--color-brand-subtle)]" />
        <span className="absolute h-36 w-36 rounded-full bg-[var(--color-accent-subtle)]" />
        <span className="relative text-sm font-medium text-[var(--color-ink-muted)]">Breathe in…</span>
      </div>

      {user?.whyIStarted && (
        <>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
            Why you started
          </p>
          <p className="mt-2 font-display text-xl leading-snug text-[var(--color-ink)]">
            &ldquo;{user.whyIStarted}&rdquo;
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/breathe"
          className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]"
        >
          Two minutes of breathing
        </Link>
        {user?.trustedPhone && (
          <a
            href={`tel:${user.trustedPhone.replace(/[^0-9]/g, "")}`}
            className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-6 py-3 font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
          >
            Call {user.trustedName}
          </a>
        )}
      </div>
    </div>
  );
}
