import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Circle, CheckCircle, CaretLeft, CaretRight, Lock } from "@phosphor-icons/react/dist/ssr";
import { getConfig } from "@/lib/config";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay, getDayView } from "@/lib/program";

function categoryLabel(c: string) {
  return c[0] + c.slice(1).toLowerCase();
}

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayParam } = await params;
  const dayNumber = Number(dayParam);
  const config = await getConfig();
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > config.programDays) notFound();

  const user = await requireOnboardedUser();
  const today = currentDay(user);

  if (dayNumber > today) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-[560px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]">
          <Lock size={26} />
        </span>
        <h1 className="font-display mt-6 text-3xl text-[var(--color-ink)]">Not yet.</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Day {dayNumber} unlocks in {dayNumber - today} day{dayNumber - today > 1 ? "s" : ""}. One at a time.
        </p>
        <Link href="/journey" className="mt-6 text-sm text-[var(--color-accent)] hover:underline">
          Back to your journey
        </Link>
      </div>
    );
  }

  const day = await getDayView(user.id, dayNumber);
  if (!day) notFound();

  const mandatory = day.tasks.filter((t) => t.mandatory);
  const optional = day.tasks.filter((t) => !t.mandatory);
  const points = mandatory.reduce((s, t) => s + t.points, 0);

  return (
    <div className="mx-auto max-w-[1040px]">
      <Link
        href="/journey"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="eyebrow">
            Phase {day.phaseOrder} · {day.phaseName}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-ink)] text-lg font-medium text-white">
              {dayNumber}
            </span>
            <h1 className="font-display text-[2.5rem] leading-none text-[var(--color-ink)]">
              Day {dayNumber}
            </h1>
          </div>
          <p className="mt-3 text-sm text-[var(--color-accent)]">
            {day.progress.done} of {day.progress.total} done
            {dayNumber === today ? <span className="text-[var(--color-ink-muted)]"> · Today</span> : null}
          </p>

          {day.videos.length > 0 && (
            <section className="mt-8">
              <p className="eyebrow mb-3">
                Watch first · {day.videos.length} video{day.videos.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {day.videos.slice(0, 2).map((v) => (
                  <div
                    key={v.id}
                    className="group relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-brand-ink)]"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white/25">
                        <Play size={20} weight="fill" className="text-white" />
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-sm font-medium text-white">{v.title}</p>
                      <p className="text-xs text-white/60">{v.durationLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <p className="eyebrow mb-1">
              The {mandatory.length} essentials · {points} points to earn
            </p>
            <div className="mt-2 divide-y divide-[var(--color-line)] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
              {mandatory.map((t) => (
                <Link
                  key={t.id}
                  href={`/journey/day/${dayNumber}/task/${t.id}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--color-surface-sunken)]"
                >
                  {t.completed ? (
                    <CheckCircle size={22} weight="fill" className="text-[var(--color-success)]" />
                  ) : (
                    <Circle size={22} className="text-[var(--color-line-strong)]" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${t.completed ? "text-[var(--color-ink-muted)] line-through" : "text-[var(--color-ink)]"}`}>
                      {t.title}
                    </p>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      {categoryLabel(t.category)} · {t.estimatedMinutes} min
                    </p>
                  </div>
                  <span className="text-sm font-medium text-[var(--color-accent)]">+{t.points}</span>
                </Link>
              ))}
            </div>
          </section>

          <p className="mt-8 text-center text-sm italic text-[var(--color-ink-faint)]">
            Start anywhere. Any of these counts.
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-6 text-sm">
            {dayNumber > 1 ? (
              <Link
                href={`/journey/day/${dayNumber - 1}`}
                className="flex items-center gap-2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <CaretLeft size={16} />
                <span>
                  <span className="eyebrow block">Previous</span>Day {dayNumber - 1}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {dayNumber < today ? (
              <Link
                href={`/journey/day/${dayNumber + 1}`}
                className="flex items-center gap-2 text-right text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <span>
                  <span className="eyebrow block">Next</span>Day {dayNumber + 1}
                </span>
                <CaretRight size={16} />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>

        <aside>
          {optional.length > 0 && (
            <>
              <p className="eyebrow mb-3">If you have more in you</p>
              <div className="flex flex-col gap-3">
                {optional.map((t) => (
                  <Link
                    key={t.id}
                    href={`/journey/day/${dayNumber}/task/${t.id}`}
                    className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-line-strong)]"
                  >
                    {t.completed ? (
                      <CheckCircle size={18} weight="fill" className="text-[var(--color-success)]" />
                    ) : (
                      <Circle size={18} className="text-[var(--color-line-strong)]" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-ink)]">{t.title}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {categoryLabel(t.category)} · {t.estimatedMinutes} min
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[var(--color-accent)]">+{t.points}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
