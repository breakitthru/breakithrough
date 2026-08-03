import Link from "next/link";
import { Confetti } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";

// Broke It Through — Day 60 milestone (D30).
export default async function JourneyCompletePage() {
  const config = await getConfig();
  const stats = [
    { n: config.programDays, l: "Days" },
    { n: "~300", l: "Points" },
    { n: 12, l: "Badges" },
  ];
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)]">
        <Confetti size={38} weight="fill" />
      </span>
      <p className="eyebrow mt-8">Day {config.programDays} · Complete</p>
      <h1 className="font-display mt-2 max-w-xl text-[3.25rem] leading-[1.04] text-[var(--color-ink)]">
        You broke it through.
      </h1>
      <p className="mt-4 max-w-md text-[var(--color-ink-muted)]">
        Sixty days, one at a time — and you&rsquo;re still here. That&rsquo;s not nothing. That&rsquo;s
        everything.
      </p>

      <div className="mt-10 flex gap-10">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="font-display text-4xl text-[var(--color-accent)]">{s.n}</p>
            <p className="eyebrow mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-sm text-sm text-[var(--color-ink-muted)]">
        Your completion shirt is on its way. Your space stays yours — reflections, points and badges
        never expire.
      </p>
      <Link href="/today" className="mt-8">
        <Button variant="primary" size="lg">
          Back to Today
        </Button>
      </Link>
    </div>
  );
}
