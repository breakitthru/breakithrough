import Link from "next/link";
import { Check, LockKey } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";

// Paywall (D57) — framed as progress, shown when the trial ends (Day 5 wall).
export default async function TrialEndedPage() {
  const config = await getConfig();
  const remaining = config.programDays - config.trialDays;
  const holds = [
    "5 tasks a day, written by a clinician",
    "Short videos to walk you through them",
    "Your notebook, points and community",
    "SOS and helplines — free, always",
  ];

  return (
    <div className="mx-auto max-w-[720px]">
      <p className="eyebrow">
        Your trial · Day {config.trialDays} of {config.trialDays}
      </p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        You did four days.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        That&rsquo;s the hardest part of starting. Here&rsquo;s the other fifty-six.
      </p>

      {/* Progress hero */}
      <div className="mt-7 rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)] p-7 text-[var(--color-brand-fg)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
          You&rsquo;ve shown up
        </p>
        <h2 className="font-display mt-2 text-[2rem] leading-tight">Four days, behind you.</h2>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[var(--color-accent)]"
            style={{ width: `${(config.trialDays / config.programDays) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-white/60">
          12 tasks done · 12 points earned · {config.trialDays} of {config.programDays} days
        </p>
      </div>

      {/* What's next */}
      <Card className="mt-5 p-6">
        <p className="eyebrow">What the next {remaining} days hold</p>
        <ul className="mt-3 space-y-2.5">
          {holds.map((h) => (
            <li key={h} className="flex items-center gap-2.5 text-[var(--color-ink)]">
              <Check size={18} weight="bold" className="text-[var(--color-accent)]" /> {h}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-10 text-center">
        <p className="font-display text-[3rem] leading-none text-[var(--color-ink)]">
          ₹{config.programPriceInr}
        </p>
        <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
          one payment · all {config.programDays} days · no subscription
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
          <LockKey size={14} /> Secure · no auto-renewal · your data stays private
        </p>
        <Link href="/checkout/payment">
          <Button variant="primary" size="lg">
            Continue my {config.programDays} days · ₹{config.programPriceInr}
          </Button>
        </Link>
      </div>
    </div>
  );
}
