import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/session";
import { getAchievement } from "@/lib/program";
import { badgeIconFor } from "@/components/app/badge-icon";

/*
  Badge detail / earned celebration (D41). Reached right after a badge unlocks
  (via completeTask / saveReflection routing here) or by tapping any badge.
  Earned badges celebrate; locked ones show how close you are.
*/
export default async function BadgeDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const user = await requireOnboardedUser();
  const badge = await getAchievement(user, key);
  if (!badge) notFound();

  const Icon = badgeIconFor(badge.key);
  const pct = badge.target > 0 ? Math.round((badge.current / badge.target) * 100) : 0;

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[560px] flex-col items-center justify-center text-center">
      {/* Emblem: evergreen disc, clay ring, soft glow */}
      <div className="relative flex h-56 w-56 items-center justify-center">
        {badge.earned && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, var(--color-accent-subtle) 0%, transparent 62%)",
            }}
          />
        )}
        <div
          className={`flex h-40 w-40 items-center justify-center rounded-full ${
            badge.earned
              ? "ring-2 ring-[var(--color-accent)] ring-offset-[14px] ring-offset-[var(--color-canvas)]"
              : ""
          }`}
        >
          <span
            className={`flex h-24 w-24 items-center justify-center rounded-full ${
              badge.earned
                ? "bg-[var(--color-brand-ink)] text-white"
                : "border-2 border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]"
            }`}
          >
            {badge.earned ? <Icon size={40} weight="fill" /> : <Lock size={34} />}
          </span>
        </div>
      </div>

      <p className="eyebrow mt-8 text-[var(--color-accent)]">
        {badge.earned ? "Badge earned" : "Locked badge"}
      </p>
      <h1 className="font-display mt-2 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        {badge.name}.
      </h1>
      <p className="mt-3 max-w-[440px] text-[var(--color-ink-muted)]">
        {badge.earned
          ? `${badge.description} It's yours for good — nothing here is ever taken back.`
          : badge.description}
      </p>

      {!badge.earned && badge.target > 0 && (
        <div className="mt-6 w-full max-w-[320px]">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {badge.current} of {badge.target} so far
          </p>
        </div>
      )}

      <div className="mt-10 flex w-full max-w-[360px] flex-col items-center gap-4">
        <Link
          href="/progress/badges"
          className="text-sm font-medium text-[var(--color-ink-muted)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline"
        >
          See all badges
        </Link>
        <Link href="/today" className="w-full">
          <Button variant="primary" size="lg" className="w-full">
            Back to today
          </Button>
        </Link>
      </div>
    </div>
  );
}
