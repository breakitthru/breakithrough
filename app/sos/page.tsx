import Link from "next/link";
import { Phone, Waveform, ChatCircle, CaretRight, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { getCurrentUser } from "@/lib/session";

/*
  SOS triage — three doors. Works WITHOUT login and WITHOUT payment, never behind
  a spinner. If a user is signed in with a trusted contact, we surface it.
*/
export default async function SosPage() {
  const user = await getCurrentUser();
  const trusted = user?.trustedName;

  return (
    <div>
      <p className="eyebrow">SOS</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        What do you need?
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Three ways through the next few minutes. Always free, always private.
      </p>

      <div className="mt-8 space-y-4">
        <Link
          href="/sos/helplines"
          className="flex items-center gap-5 rounded-[var(--radius-lg)] bg-[var(--color-crisis-subtle)] p-6 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] bg-white text-[var(--color-crisis)]">
            <Phone size={26} weight="fill" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--color-crisis)]">
              I&rsquo;m not safe right now
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Free 24×7 helplines, and emergency numbers.
            </p>
          </div>
          <CaretRight size={20} className="text-[var(--color-crisis)]" />
        </Link>

        <Link
          href="/sos/ride"
          className="flex items-center gap-5 rounded-[var(--radius-lg)] bg-[var(--color-brand-subtle)] p-6 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full text-[var(--color-accent)] ring-2 ring-[var(--color-accent)]">
            <Waveform size={26} weight="fill" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
              Ride it out
            </p>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">
              I&rsquo;m about to relapse
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Two minutes of breathing, and why you started.
            </p>
          </div>
        </Link>

        <Link
          href="/daylight"
          className="flex items-center gap-5 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
            <ChatCircle size={24} weight="fill" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">I just need to talk</h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              {trusted ? `Call ${trusted}, or talk it out with Daylight.` : "Talk it out with Daylight."}
            </p>
          </div>
          <CaretRight size={20} className="text-[var(--color-ink-faint)]" />
        </Link>
      </div>

      <a
        href="tel:112"
        className="mt-8 flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-crisis)] py-4 font-medium text-[var(--color-crisis)] transition-colors hover:bg-[var(--color-crisis-subtle)]"
      >
        <Phone size={18} weight="fill" /> In immediate help? Call 112
      </a>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-[var(--color-ink-faint)]">
        <LockSimple size={13} /> Private — nothing you do here is shared
      </p>
    </div>
  );
}
