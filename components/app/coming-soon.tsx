import { Clock } from "@phosphor-icons/react/dist/ssr";

/** Shared "coming soon" state for features not built this pass (Sessions, Community). */
export function ComingSoon({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
}) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
        <Clock size={30} weight="fill" />
      </span>
      <p className="eyebrow mt-6">{eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl text-[var(--color-ink)]">{title}</h1>
      <p className="mt-3 max-w-md text-[var(--color-ink-muted)]">{blurb}</p>
      <span className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent-subtle-ink)]">
        Coming soon
      </span>
    </div>
  );
}
