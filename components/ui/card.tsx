import * as React from "react";
import { cn } from "@/lib/utils";

/** Warm raised surface used for most content blocks. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-card
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-[transform,border-color,box-shadow,background-color] duration-150 ease-out",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "brand" | "accent" | "success" | "caution" | "info" | "crisis";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]",
    brand: "bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]",
    accent: "bg-[var(--color-accent-subtle)] text-[var(--color-accent-subtle-ink)]",
    success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
    caution: "bg-[var(--color-caution-subtle)] text-[var(--color-caution)]",
    info: "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
    crisis: "bg-[var(--color-crisis-subtle)] text-[var(--color-crisis)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
