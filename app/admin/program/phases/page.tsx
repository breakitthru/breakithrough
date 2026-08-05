import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getPhases } from "@/lib/config";
import { PageHeader } from "@/components/admin/ui";
import { ProgramTabs } from "@/components/admin/program/program-tabs";
import { PhaseBadgeManager } from "@/components/admin/program/phase-badge-manager";

type Crit = { type: string; n: number };

export default async function PhasesPage() {
  await requirePermission("program.edit");
  const [phases, badges] = await Promise.all([getPhases(), prisma.badge.findMany({ orderBy: { order: "asc" } })]);

  return (
    <>
      <PageHeader eyebrow="Program" title="Phases & badges" subtitle="Rename phases, shift day ranges, and manage the badge set. Members see these." />
      <ProgramTabs />
      <PhaseBadgeManager
        phases={phases}
        badges={badges.map((b) => {
          const c = (b.criteria as Crit | null) ?? { type: "tasks", n: 1 };
          return { id: b.id, key: b.key, name: b.name, description: b.description, order: b.order, critType: c.type, critN: c.n };
        })}
      />
    </>
  );
}
