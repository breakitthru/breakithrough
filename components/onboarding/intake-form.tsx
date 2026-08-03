"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeartBreak,
  Butterfly,
  CloudRain,
  Sparkle,
  Sun,
  MoonStars,
  Leaf,
  Tree,
  Waveform,
  Moon,
  SunHorizon,
  Smiley,
  Path,
  Check,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StepBar } from "./split-canvas";
import type { IntakeQuestion } from "@/lib/onboarding";

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  HeartBreak,
  Butterfly,
  CloudRain,
  Sparkle,
  Sun,
  MoonStars,
  Leaf,
  Tree,
  Waveform,
  Moon,
  SunHorizon,
  Smiley,
  Path,
};

export function IntakeForm({ question, total }: { question: IntakeQuestion; total: number }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function next() {
    if (question.step < total) router.push(`/welcome/intake/${question.step + 1}`);
    else router.push("/welcome/plan");
  }

  return (
    <div>
      <StepBar step={question.step} total={total} />

      <h1 className="font-display mt-8 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        {question.title}
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">{question.subtitle}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((opt) => {
          const Icon = ICONS[opt.icon] ?? Sparkle;
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                active
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-strong)]"
              }`}
            >
              <span className="text-[var(--color-ink-muted)]">
                <Icon size={22} />
              </span>
              <span className="flex-1 font-medium text-[var(--color-ink)]">{opt.label}</span>
              {active && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-[var(--color-brand-fg)]">
                  <Check size={13} weight="bold" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-[var(--color-ink-faint)]">{question.footnote}</p>
        <Button variant="primary" onClick={next} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>
  );
}
