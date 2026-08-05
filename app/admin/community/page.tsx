import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr";
import { requireStaff } from "@/lib/admin";
import { PageHeader, EmptyState } from "@/components/admin/ui";

export default async function CommunityComingSoon() {
  await requireStaff();
  return (
    <>
      <PageHeader eyebrow="Members" title="Community" subtitle="Reports and moderation." />
      <EmptyState icon={<ChatCircleDots size={22} />} title="Coming soon." body="The community feed and its moderation queue aren't live yet." />
    </>
  );
}
