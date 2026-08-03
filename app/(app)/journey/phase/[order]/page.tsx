import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { PHASES } from "@/lib/config";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay, dayStatus } from "@/lib/program";

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ order: string }>;
}) {
  const { order } = await params;
  const phase = PHASES.find((p) => p.order === Number(order));
  if (!phase) notFound();

  const user = await requireOnboardedUser();
  const today = currentDay(user);
  const days = Array.from({ length: phase.dayEnd - phase.dayStart + 1 }, (_, i) => {
    const dayNumber = phase.dayStart + i;
    return { dayNumber, status: dayStatus(dayNumber, today) };
  });
  const done = days.filter((d) => d.status === "completed").length;

  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/journey"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Journey
      </Link>

      <p className="eyebrow">
        Phase {phase.order} · Days {phase.dayStart}&ndash;{phase.dayEnd}
      </p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        {phase.name}
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        {done} of {days.length} days done in this phase.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-2">
        {days.map((d) => {
          const clickable = d.status !== "upcoming";
          const inner = (
            <Card
              className={`flex items-center gap-4 p-4 ${
                clickable ? "transition-colors hover:border-[var(--color-line-strong)]" : "opacity-70"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  d.status === "completed"
                    ? "bg-[var(--color-brand-ink)] text-white"
                    : d.status === "today"
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                      : "border border-[var(--color-line-strong)] text-[var(--color-ink-faint)]"
                }`}
              >
                {d.status === "completed" ? <Check size={16} weight="bold" /> : d.dayNumber}
              </span>
              <span className="flex-1 font-medium text-[var(--color-ink)]">Day {d.dayNumber}</span>
              <span className="text-sm text-[var(--color-ink-muted)]">
                {d.status === "completed" ? "Done" : d.status === "today" ? "Today" : "Upcoming"}
              </span>
            </Card>
          );
          return clickable ? (
            <Link key={d.dayNumber} href={`/journey/day/${d.dayNumber}`}>
              {inner}
            </Link>
          ) : (
            <div key={d.dayNumber}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
