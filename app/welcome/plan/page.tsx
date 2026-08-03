import Link from "next/link";
import { Button } from "@/components/ui/button";

// Plan in review — a short branded interstitial. Sets the expectation that the
// program is authored, not generated. (Auto-advance/animation added later.)
export default function PlanPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-brand-ink)] px-6 text-center text-[var(--color-brand-fg)]">
      <div className="mb-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] opacity-80" />
        ))}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
        Preparing your program
      </p>
      <h1 className="font-display mt-3 max-w-lg text-[2.75rem] leading-tight">
        Putting your first week together.
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        Every day was written by a clinician — not generated, not automated. We&rsquo;re lining it up
        to where you are.
      </p>
      <Link href="/welcome/program" className="mt-10">
        <Button variant="accent" size="lg">
          See my program
        </Button>
      </Link>
    </div>
  );
}
