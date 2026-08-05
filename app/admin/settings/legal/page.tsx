import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { PolicyManager } from "@/components/admin/settings/policy-manager";

export default async function LegalSettingsPage() {
  await requirePermission("settings.edit");
  const policies = await prisma.policy.findMany({ orderBy: { key: "asc" } });

  return (
    <>
      <PageHeader eyebrow="Settings" title="Legal & policies" subtitle="Versioned documents. Each save publishes a new version with a live-since date." />
      <SettingsTabs />
      <PolicyManager
        policies={policies.map((p) => ({ key: p.key, title: p.title, version: p.version, body: p.body, liveSince: p.liveSince ? p.liveSince.toISOString() : null }))}
      />
    </>
  );
}
