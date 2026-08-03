import Link from "next/link";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Meet your program (D10) — introduces the clinician who authored the 60 days.
export default function MeetProgramPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[560px] text-center">
        <p className="eyebrow">Meet your program</p>
        <h1 className="font-display mt-2 text-[2.5rem] leading-tight text-[var(--color-ink)]">
          Written by one person, for you.
        </h1>

        <Card className="mt-8 p-8 text-left">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand)] text-2xl font-semibold text-[var(--color-brand-fg)]">
              A
            </span>
            <div>
              <p className="text-lg font-semibold text-[var(--color-ink)]">Dr. Ananya Rao</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                Clinical Psychologist · 12 years
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3 text-[var(--color-ink-muted)]">
            <Quotes size={22} weight="fill" className="shrink-0 text-[var(--color-accent)]" />
            <p className="italic">
              I built these 60 days so you&rsquo;re never guessing what to do next. Small steps,
              every day, in an order that works.
            </p>
          </div>
        </Card>

        <Link href="/welcome/consent">
          <Button variant="primary" size="lg" className="mt-8 w-full max-w-xs">
            Continue
          </Button>
        </Link>
      </div>
    </div>
  );
}
