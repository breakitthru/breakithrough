import Link from "next/link";
import { Flag } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getPhases } from "@/lib/config";
import { PageHeader } from "@/components/admin/ui";
import { ProgramTabs } from "@/components/admin/program/program-tabs";

export default async function ProgramPage() {
  await requirePermission("program.edit");
  const phases = await getPhases();
  const days = await prisma.day.findMany({
    orderBy: { dayNumber: "asc" },
    select: {
      dayNumber: true,
      isMilestone: true,
      _count: { select: { tasks: true, videos: true } },
    },
  });
  const byNumber = new Map(days.map((d) => [d.dayNumber, d]));

  return (
    <>
      <PageHeader eyebrow="Program" title="The 60 days" subtitle="Edits go live for members immediately. Tap a day to author it." />
      <ProgramTabs />

      <div className="flex flex-col gap-5">
        {phases.map((phase) => {
          const phaseDays = [];
          for (let d = phase.dayStart; d <= phase.dayEnd; d++) phaseDays.push(d);
          const taskTotal = phaseDays.reduce((a, d) => a + (byNumber.get(d)?._count.tasks ?? 0), 0);
          const videoTotal = phaseDays.reduce((a, d) => a + (byNumber.get(d)?._count.videos ?? 0), 0);
          return (
            <section key={phase.order} className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-sm font-semibold text-[var(--color-brand-subtle-ink)]">
                  {phase.order}
                </span>
                <div>
                  <h2 className="font-semibold text-[var(--color-ink)]">{phase.name}</h2>
                  <p className="text-xs text-[var(--color-ink-faint)]">
                    Days {phase.dayStart}–{phase.dayEnd} · {taskTotal} tasks · {videoTotal} videos
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {phaseDays.map((d) => {
                  const info = byNumber.get(d);
                  return (
                    <Link
                      key={d}
                      href={`/admin/program/day/${d}`}
                      className="group rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-canvas)] px-3 py-2.5 transition-colors hover:border-[var(--color-accent)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[var(--color-ink)]">{d}</span>
                        {info?.isMilestone && <Flag size={13} weight="fill" className="text-[var(--color-accent)]" />}
                      </div>
                      <p className="mt-1 text-[0.7rem] text-[var(--color-ink-faint)]">
                        ✓{info?._count.tasks ?? 0} · ▷{info?._count.videos ?? 0}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
