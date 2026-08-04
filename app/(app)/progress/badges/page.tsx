import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireOnboardedUser } from "@/lib/session";
import { getAchievements } from "@/lib/program";
import { BadgeIcon } from "@/components/app/badge-icon";

export default async function BadgesPage() {
  const user = await requireOnboardedUser();
  const badges = await getAchievements(user);
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
        {badges.map((b, i) => (
          <Link
            key={b.id}
            href={`/progress/badges/${b.key}`}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <span className="transition-transform group-hover:-translate-y-0.5">
              <BadgeIcon badgeKey={b.key} earned={b.earned} index={i} size={80} iconSize={30} />
            </span>
            <span className="text-xs font-medium text-[var(--color-ink)]">{b.name}</span>
            {b.earned ? (
              <span className="text-[0.7rem] leading-tight text-[var(--color-ink-faint)]">
                {b.description}
              </span>
            ) : (
              b.target > 0 && (
                <span className="text-[0.7rem] leading-tight text-[var(--color-ink-faint)]">
                  {b.current} / {b.target}
                </span>
              )
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
