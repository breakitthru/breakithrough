import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play } from "@phosphor-icons/react/dist/ssr";
import { Chip } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { getProgramState } from "@/lib/program";
import { TaskComplete } from "@/components/app/task-complete";

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

  const user = await requireOnboardedUser();
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { day: true, videos: true },
  });
  if (!task || task.day.dayNumber !== dayNumber) notFound();
  const state = await getProgramState(user);
  if (!state.isAccessible(dayNumber)) redirect("/trial/ended");
  if (task.day.dayNumber > state.unlockedDay) notFound();

  const completion = await prisma.taskCompletion.findUnique({
    where: { userId_taskId: { userId: user.id, taskId } },
  });

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
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-brand-ink)]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
              <Play size={24} weight="fill" className="text-white" />
            </span>
            <p className="text-xs text-white/50">
              {task.videos[0]?.title ?? "Video"} — placeholder
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Why this matters</h2>
          <p className="mt-2 text-[var(--color-ink-muted)]">
            {task.whyItMatters ?? "The clinician's note for this task goes here."}
          </p>

          <h2 className="mt-6 text-base font-semibold text-[var(--color-ink)]">Steps</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[var(--color-ink-muted)]">
            <li>Placeholder step one.</li>
            <li>Placeholder step two.</li>
          </ol>
        </div>
      </div>

      <TaskComplete
        taskId={task.id}
        dayNumber={dayNumber}
        points={task.points}
        responseType={task.responseType}
        completed={Boolean(completion)}
      />
    </div>
  );
}
