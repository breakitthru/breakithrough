/*
  Shown instantly while a route's server component + data load, so navigation
  feels immediate instead of dead-clicking until the page is ready. Calm pulse
  using existing surface tokens only — no new colours, no layout of its own.
*/
export default function Loading() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="h-3.5 w-36 rounded-full bg-[var(--color-surface-sunken)]" />
      <div className="mt-4 h-9 w-72 max-w-full rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]" />
      <div className="mt-8 h-36 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]" />
      <div className="mt-5 grid grid-cols-3 gap-4">
        <div className="h-20 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]" />
        <div className="h-20 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]" />
        <div className="h-20 rounded-[var(--radius-lg)] bg-[var(--color-surface-sunken)]" />
      </div>
    </div>
  );
}
