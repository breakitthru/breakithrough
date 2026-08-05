import * as React from "react";
import { Card, Chip } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* Shared, server-friendly admin building blocks. Colours come from existing tokens. */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-display mt-1 text-[2.25rem] leading-tight text-[var(--color-ink)]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-[var(--color-ink-muted)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "neutral" | "alert";
}) {
  return (
    <Card
      className={cn(
        "p-5",
        tone === "alert" && "border-[var(--color-crisis)] bg-[var(--color-crisis-subtle)]/40",
      )}
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-faint)]">
        {label}
      </p>
      <p className="font-display mt-2 text-[2rem] leading-none text-[var(--color-ink)]">{value}</p>
      {hint && <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{hint}</p>}
    </Card>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-12 text-center">
      {icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]">
          {icon}
        </span>
      )}
      <p className="font-medium text-[var(--color-ink)]">{title}</p>
      {body && <p className="max-w-md text-sm text-[var(--color-ink-muted)]">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}

const STATUS_TONE: Record<string, React.ComponentProps<typeof Chip>["tone"]> = {
  // payments
  PAID: "success",
  CREATED: "info",
  FAILED: "crisis",
  REFUNDED: "caution",
  // redemptions
  REQUESTED: "info",
  FULFILLED: "success",
  CANCELLED: "neutral",
  // plans
  TRIAL: "info",
  ACTIVE: "success",
  EXPIRED: "caution",
  COMPLETED: "brand",
  // generic
  READY: "success",
  REVIEWED: "success",
  OPEN: "caution",
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <Chip tone={STATUS_TONE[status] ?? "neutral"} className="uppercase tracking-wide">
      {label ?? status.toLowerCase()}
    </Chip>
  );
}

/** A titled content section wrapper. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-6", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
