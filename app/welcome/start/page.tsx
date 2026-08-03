import { Confetti } from "@phosphor-icons/react/dist/ssr";
import { StartButton } from "@/components/onboarding/start-button";

// Trial start (D14) — you're in, Day 1 is ready.
export default function TrialStartPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-brand-ink)] px-6 text-center text-[var(--color-brand-fg)]">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)]">
        <Confetti size={38} weight="fill" />
      </span>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
        Your four free days start now
      </p>
      <h1 className="font-display mt-3 max-w-lg text-[3rem] leading-[1.05]">
        You&rsquo;re in.
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        No card, no pressure. Just Day 1, waiting whenever you&rsquo;re ready. Take it one small thing
        at a time.
      </p>
      <div className="mt-10">
        <StartButton />
      </div>
    </div>
  );
}
