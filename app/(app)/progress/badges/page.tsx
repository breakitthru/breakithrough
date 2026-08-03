import Link from "next/link";
import { ArrowLeft, Lock, Medal } from "@phosphor-icons/react/dist/ssr";
import { badges } from "@/lib/mock";

export default function BadgesPage() {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/progress"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Progress
      </Link>
      <p className="eyebrow">Badges</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        {earned} of {badges.length} earned.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">Badges are never taken away, once earned.</p>

      <div className="mt-8 grid grid-cols-3 gap-5 sm:grid-cols-4">
        {badges.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-2 text-center">
            <span
              className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                b.earned
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]"
              }`}
            >
              {b.earned ? <Medal size={30} weight="fill" /> : <Lock size={24} />}
            </span>
            <span className="text-xs font-medium text-[var(--color-ink)]">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
