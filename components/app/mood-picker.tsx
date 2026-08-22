"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { SmileySad, SmileyMeh, Smiley, SmileyWink, ChartLineUp } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { saveMood } from "@/lib/actions";

const MOODS = [
  { Icon: SmileySad, label: "Heavy" },
  { Icon: SmileyMeh, label: "Flat" },
  { Icon: Smiley, label: "Okay" },
  { Icon: SmileyWink, label: "Lighter" },
];

/*
  Today's mood check-in. Tapping a face records it (upserts in the DB) and tints
  that face clay; it does NOT open the journal. The journal only opens when the
  user explicitly chooses "Write instead" or "I want to write about it".
*/
export function MoodPicker({ initial }: { initial: number | null }) {
  const [selected, setSelected] = useState<number | null>(initial);
  const [pending, startTransition] = useTransition();

  function pick(value: number) {
    if (pending) return;
    const previous = selected;
    setSelected(value); // optimistic
    startTransition(async () => {
      const res = await saveMood(value);
      if (!res.ok) setSelected(previous);
    });
  }

  return (
    <Card className="mt-5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-ink)]">How&rsquo;s today feeling?</h3>
        <Link
          href="/reflections/new"
          className="text-sm font-medium text-[var(--color-brand)] underline-offset-4 hover:underline"
        >
          Write instead
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {MOODS.map(({ Icon, label }, i) => {
          const active = selected === i;
          return (
            <button
              key={label}
              type="button"
              onClick={() => pick(i)}
              aria-label={label}
              aria-pressed={active}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              }`}
            >
              <Icon size={24} weight={active ? "fill" : "regular"} />
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          Noted.{" "}
          <Link
            href="/reflections/new"
            className="font-medium text-[var(--color-brand)] underline-offset-4 hover:underline"
          >
            I want to write about it
          </Link>
        </p>
      )}

      <Link
        href="/mood-tracker"
        className="mt-5 flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-4 py-3 transition-colors hover:border-[var(--color-accent)]"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            <ChartLineUp size={18} weight="fill" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--color-ink)]">Mood &amp; anxiety tracker</span>
            <span className="block text-xs text-[var(--color-ink-muted)]">Log details, see your patterns and triggers</span>
          </span>
        </span>
        <span className="text-sm font-medium text-[var(--color-brand)]">Open</span>
      </Link>
    </Card>
  );
}
