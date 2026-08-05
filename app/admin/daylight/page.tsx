import { Sparkle } from "@phosphor-icons/react/dist/ssr";
import { requireStaff } from "@/lib/admin";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function DaylightComingSoon() {
  await requireStaff();
  return (
    <>
      <PageHeader eyebrow="Program" title="Daylight" subtitle="The AI companion's voice, safety and consent." />
      <EmptyState icon={<Sparkle size={22} />} title="Coming soon." body="Daylight settings arrive once the AI provider and safety routing are finalised." />
    </>
  );
}
