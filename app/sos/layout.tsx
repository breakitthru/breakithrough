import Link from "next/link";

/*
  SOS shell — deliberately OUTSIDE the authenticated app group so it works
  without login and without payment (a safety requirement). No sidebar, no gate.
*/
export default function SosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/today" className="flex h-9 w-20 items-center justify-center rounded-[var(--radius-sm)] border border-dashed border-[var(--color-line-strong)] text-xs text-[var(--color-ink-faint)]">
          Logo
        </Link>
      </header>
      <div className="mx-auto max-w-[840px] px-6 pb-16">{children}</div>
    </div>
  );
}
