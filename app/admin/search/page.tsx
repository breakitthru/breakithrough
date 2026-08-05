import { requireStaff } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";

// Search stub for Phase 0; global search + alerts panel land in Phase 8.
export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const { q } = await searchParams;
  return (
    <PageHeader
      eyebrow="Search"
      title={q ? `Results for "${q}"` : "Search"}
      subtitle="Global search across members, days and staff is coming online."
    />
  );
}
