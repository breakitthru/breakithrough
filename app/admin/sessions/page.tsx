import { VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { requireStaff } from "@/lib/admin";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function SessionsComingSoon() {
  await requireStaff();
  return (
    <>
      <PageHeader eyebrow="Business" title="Sessions" subtitle="Specialists, bookings and payouts." />
      <EmptyState icon={<VideoCamera size={22} />} title="Coming soon." body="1:1 sessions aren't live yet — this area lands once the specialist roster and video provider are in place." />
    </>
  );
}
