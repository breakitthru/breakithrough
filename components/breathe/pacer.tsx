"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

// Breathing pacer (D23) + completion (D24). Respects prefers-reduced-motion via
// the global CSS rule (animations collapse to near-zero there).
export function BreathePacer({ totalSeconds = 120 }: { totalSeconds?: number }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [done, setDone] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (done) return;
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      const left = totalSeconds - elapsed;
      setRemaining(left);
      setPhase(Math.floor(elapsed / 4) % 2 === 0 ? "in" : "out");
      if (left <= 0) {
        clearInterval(tick);
        setDone(true);
      }
    }, 250);
    return () => clearInterval(tick);
  }, [done, totalSeconds]);

  if (done) {
    return (
      <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-subtle)] text-[var(--color-success)]">
          <CheckCircle size={40} weight="fill" />
        </span>
        <p className="eyebrow mt-6">You rode it out</p>
        <h1 className="font-display mt-2 text-[2.5rem] leading-tight text-[var(--color-ink)]">
          The wave passed.
        </h1>
        <p className="mt-3 max-w-sm text-[var(--color-ink-muted)]">
          Urges peak and pass — you just proved it. That&rsquo;s +1 point, and one more you rode out.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/today">
            <Button variant="primary">Back to Today</Button>
          </Link>
          <Link href="/reflections/new">
            <Button variant="ghost">Write about it</Button>
          </Link>
        </div>
      </div>
    );
  }

  const mm = Math.floor(Math.max(0, remaining) / 60);
  const ss = String(Math.max(0, remaining) % 60).padStart(2, "0");

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <span className="breathe-ring absolute h-64 w-64 rounded-full bg-[var(--color-brand-subtle)]" />
        <span className="breathe-ring absolute h-40 w-40 rounded-full bg-[var(--color-accent-subtle)]" />
        <span className="relative font-display text-xl text-[var(--color-ink)]">
          {phase === "in" ? "Breathe in…" : "…and out"}
        </span>
      </div>
      <p className="mt-10 font-display text-2xl text-[var(--color-ink-muted)]">
        {mm}:{ss}
      </p>
      <p className="mt-2 max-w-xs text-sm text-[var(--color-ink-faint)]">
        Follow the circle. There&rsquo;s nowhere else to be right now.
      </p>
      <button
        onClick={() => setDone(true)}
        className="mt-8 text-sm text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
      >
        I&rsquo;m okay now
      </button>

      <style>{`
        @keyframes breatheScale {
          0%, 100% { transform: scale(0.6); }
          50% { transform: scale(1); }
        }
        .breathe-ring { animation: breatheScale 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
