import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isStreamConfigured } from "@/lib/cloudflare-stream";
import { getPhases, phaseForDayIn } from "@/lib/config";
import { PageHeader } from "@/components/admin/ui";
import { DayEditor } from "@/components/admin/program/day-editor";

export default async function DayEditorPage({ params }: { params: Promise<{ n: string }> }) {
  await requirePermission("program.edit");
  const { n } = await params;
  const dayNumber = Number(n);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 60) notFound();

  const day = await prisma.day.findUnique({
    where: { dayNumber },
    include: {
      tasks: { orderBy: { order: "asc" }, include: { _count: { select: { videos: true } } } },
      videos: { where: { taskId: null }, orderBy: { order: "asc" } },
    },
  });
  if (!day) notFound();

  const phase = phaseForDayIn(await getPhases(), dayNumber);

  return (
    <>
      <Link href="/admin/program" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> The 60 days
      </Link>
      <PageHeader eyebrow={`Phase ${phase.order} · ${phase.name}`} title={day.title ?? `Day ${dayNumber}`} subtitle="Author the tasks and videos members see on this day." />

      <DayEditor
        dayNumber={dayNumber}
        title={day.title}
        isMilestone={day.isMilestone}
        tasks={day.tasks.map((t) => ({
          id: t.id,
          order: t.order,
          title: t.title,
          category: t.category,
          responseType: t.responseType,
          estimatedMinutes: t.estimatedMinutes,
          points: t.points,
          mandatory: t.mandatory,
          hasVideo: t.hasVideo,
          whyItMatters: t.whyItMatters,
          videoCount: t._count.videos,
        }))}
        videos={day.videos.map((v) => ({ id: v.id, title: v.title, streamUid: v.streamUid, durationSec: v.durationSec }))}
        streamConfigured={isStreamConfigured}
      />
    </>
  );
}
