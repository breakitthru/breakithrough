import { requirePermission } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";

// Minimal overview for Phase 0 (the shell). Full dashboard lands in Phase 1.
export default async function AdminOverviewPage() {
  const user = await requirePermission("overview.view");
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome, ${(user.displayName ?? user.name ?? "there").split(" ")[0]}.`}
        subtitle="The admin shell is live. Section dashboards are being wired up."
      />
    </>
  );
}
