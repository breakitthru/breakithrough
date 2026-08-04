import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Circle,
  CheckCircle,
  CaretLeft,
  CaretRight,
  Lock,
  SmileySad,
  SmileyMeh,
  Smiley,
  SmileyWink,
} from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { getConfig } from "@/lib/config";
import { requireOnboardedUser } from "@/lib/session";
import { getProgramState, getDayView } from "@/lib/program";
import { prisma } from "@/lib/prisma";

function categoryLabel(c: string) {
  return c[0] + c.slice(1).toLowerCase();
}

const MOOD = [
  { Icon: SmileySad, label: "A heavy day", note: "You logged your mood as low" },
  { Icon: SmileyMeh, label: "A flat day", note: "You logged your mood as even" },
  { Icon: Smiley, label: "An okay day", note: "You logged your mood as steadier" },
  { Icon: SmileyWink, label: "A lighter day", note: "You logged your mood as lighter" },
];

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day: dayParam } = await params;
  const dayNumber = Number(dayParam);
  const config = await getConfig();
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > config.programDays) notFound();

  const user = await requireOnboardedUser();
  const state = await getProgramState(user);
  const today = state.resumeDay;

  // Paywall: trial days are open; later days need a paid plan.
  if (!state.isAccessible(dayNumber)) redirect("/trial/ended");

  if (dayNumber > state.unlockedDay) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-[560px] flex-col items-center justify-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]">
          <Lock size={26} />
        </span>
        <h1 className="font-display mt-6 text-3xl text-[var(--color-ink)]">Not yet.</h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          Day {dayNumber} unlocks in {dayNumber - state.unlockedDay} day
          {dayNumber - state.unlockedDay > 1 ? "s" : ""}. One at a time.
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
  const optionalDone = optional.filter((t) => t.completed).length;
  const dayComplete = mandatory.length > 0 && mandatory.every((t) => t.completed);
  const isToday = dayNumber === today;

  // Completed-day context: what the user wrote and how the day felt (D26).
  const [reflection, mood] = dayComplete
    ? await Promise.all([
        prisma.reflection.findFirst({
          where: { userId: user.id, dayNumber },
          orderBy: { createdAt: "desc" },
        }),
        prisma.moodLog.findUnique({
          where: { userId_dayNumber: { userId: user.id, dayNumber } },
        }),
      ])
    : [null, null];

  return (
    <div className="mx-auto max-w-[1040px]">
      <Link
        href="/journey"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="eyebrow">
            Phase {day.phaseOrder} · {day.phaseName}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-ink)] text-base font-semibold text-white">
              {dayNumber}
            </span>
            <h1 className="font-display text-[2.25rem] leading-none text-[var(--color-ink)]">
              Day {dayNumber}
            </h1>
          </div>
          {dayComplete ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-success)]">
              <CheckCircle size={16} weight="fill" /> Completed
              {isToday ? <span className="font-normal text-[var(--color-ink-muted)]"> · Today</span> : null}
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
              {day.progress.done} of {day.progress.total} done
              {isToday ? <span className="font-normal text-[var(--color-ink-muted)]"> · Today</span> : null}
            </p>
          )}

          {day.videos.length > 0 && (
            <section className="mt-6">
              <p className="eyebrow mb-2.5">
                Watch first · {day.videos.length} video{day.videos.length > 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {day.videos.slice(0, 2).map((v) => (
                  <div
                    key={v.id}
                    className="group relative aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-brand-ink)]"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-white/25">
                        <Play size={18} weight="fill" className="text-white" />
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className="text-sm font-semibold text-white">{v.title}</p>
                      <p className="text-xs text-white/60">{v.durationLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <p className="eyebrow mb-2.5">
              The {mandatory.length} essentials · {dayComplete ? `+${points} points` : `${points} points to earn`}
            </p>
            <div className="flex flex-col gap-2.5">
              {mandatory.map((t) => (
                <Link
                  key={t.id}
                  href={`/journey/day/${dayNumber}/task/${t.id}`}
                  className="flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 transition-colors hover:border-[var(--color-line-strong)]"
                >
                  {t.completed ? (
                    <CheckCircle size={22} weight="fill" className="shrink-0 text-[var(--color-success)]" />
                  ) : (
                    <Circle size={22} className="shrink-0 text-[var(--color-line-strong)]" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${t.completed ? "text-[var(--color-ink-muted)] line-through" : "text-[var(--color-ink)]"}`}>
                      {t.title}
                    </p>
                    <p className="text-[0.8rem] text-[var(--color-ink-muted)]">
                      {categoryLabel(t.category)} · {t.estimatedMinutes} min
                    </p>
                  </div>
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-success-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--color-success)]">
                    +{t.points}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <p className="mt-5 text-center text-sm italic text-[var(--color-ink-faint)]">
            Start anywhere. Any of these counts.
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4 text-sm">
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
            {dayNumber < state.unlockedDay ? (
              <Link
                href={`/journey/day/${dayNumber + 1}`}
                className="flex items-center gap-2 text-right text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                <span>
                  <span className="eyebrow block">Next</span>Day {dayNumber + 1}
                </span>
                <CaretRight size={16} />
              </Link>
            ) : dayNumber < config.programDays ? (
              <span className="flex items-center gap-2 text-right text-[var(--color-ink-faint)]">
                <span>
                  <span className="eyebrow block">Tomorrow</span>Day {dayNumber + 1}
                </span>
                <CaretRight size={16} />
              </span>
            ) : (
              <span />
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-8">
          {optional.length > 0 && (
            <div>
              <p className="eyebrow mb-3">
                {dayComplete
                  ? `Optional · ${optionalDone} of ${optional.length} done`
                  : "If you have more in you"}
              </p>
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
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{t.title}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {categoryLabel(t.category)} · {t.estimatedMinutes} min
                      </p>
                    </div>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--color-success-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--color-success)]">
                      +{t.points}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {reflection && (
            <div>
              <p className="eyebrow mb-3">What you wrote</p>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <p className="font-display text-lg leading-snug text-[var(--color-ink)]">
                  &ldquo;{reflection.body.length > 90 ? reflection.body.slice(0, 90).trimEnd() + "…" : reflection.body}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
                  <span>
                    {reflection.body.trim().split(/\s+/).length} words ·{" "}
                    {reflection.createdAt.toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <Link
                    href={`/reflections/${reflection.id}`}
                    className="font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Read entry
                  </Link>
                </div>
              </div>
            </div>
          )}

          {mood && MOOD[mood.value] && (
            <div>
              <p className="eyebrow mb-3">How the day felt</p>
              <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                  {(() => {
                    const Icon = MOOD[mood.value].Icon;
                    return <Icon size={22} weight="fill" />;
                  })()}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">{MOOD[mood.value].label}</p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{MOOD[mood.value].note}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
