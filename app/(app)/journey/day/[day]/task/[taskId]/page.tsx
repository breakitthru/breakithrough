import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play } from "@phosphor-icons/react/dist/ssr";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDay, type MockTask } from "@/lib/mock";
import { getConfig } from "@/lib/config";

function categoryLabel(c: string) {
  return c[0] + c.slice(1).toLowerCase();
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ day: string; taskId: string }>;
}) {
  const { day: dayParam, taskId } = await params;
  const dayNumber = Number(dayParam);
  const config = await getConfig();
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > config.programDays) notFound();

  const day = getDay(dayNumber);
  const task: MockTask | undefined = day.tasks.find((t) => t.id === taskId);
  if (!task) notFound();

  return (
    <div className="mx-auto max-w-[860px]">
      <Link
        href={`/journey/day/${dayNumber}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Day {dayNumber}
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <Chip tone="brand">{categoryLabel(task.category)}</Chip>
        {!task.mandatory && <Chip tone="neutral">Optional</Chip>}
        <span className="text-sm font-medium text-[var(--color-accent)]">+{task.points} point</span>
      </div>
      <h1 className="font-display mt-3 text-[2.25rem] leading-tight text-[var(--color-ink)]">
        {task.title}
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[380px_minmax(0,1fr)]">
        {/* 9:16 vertical player (blank until a real video is uploaded) */}
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Play size={24} weight="fill" className="text-white" />
            </span>
            <p className="text-xs text-white/50">Video 1 — placeholder</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Why this matters</h2>
          <p className="mt-2 text-[var(--color-ink-muted)]">{task.whyItMatters}</p>

          <h2 className="mt-6 text-base font-semibold text-[var(--color-ink)]">Steps</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[var(--color-ink-muted)]">
            <li>Placeholder step one.</li>
            <li>Placeholder step two.</li>
          </ol>

          {task.responseType === "WRITTEN" && (
            <Card className="mt-6 p-4">
              <label className="eyebrow">A few words (optional)</label>
              <textarea
                rows={4}
                placeholder="Write anything…"
                className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              />
            </Card>
          )}
        </div>
      </div>

      <div className="sticky bottom-6 mt-10">
        <Button variant="primary" size="lg" className="w-full">
          Mark complete · +{task.points}
        </Button>
      </div>
    </div>
  );
}
