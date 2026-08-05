import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ProgramTabs } from "@/components/admin/program/program-tabs";
import { VideoManager } from "@/components/admin/program/video-manager";

export default async function VideosPage() {
  await requirePermission("videos.edit");
  const rows = await prisma.video.findMany({
    orderBy: [{ dayId: "asc" }, { order: "asc" }],
    include: { day: { select: { dayNumber: true } } },
  });
  const total = rows.length;
  const ready = rows.filter((v) => v.streamUid).length;

  return (
    <>
      <PageHeader eyebrow="Program" title="Video library" subtitle={`${total} clips · ${ready} ready`} />
      <ProgramTabs />
      <VideoManager
        videos={rows.map((v) => ({ id: v.id, title: v.title, dayNumber: v.day.dayNumber, streamUid: v.streamUid, durationSec: v.durationSec }))}
      />
    </>
  );
}
