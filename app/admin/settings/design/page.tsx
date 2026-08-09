import { requirePermission } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { PageHeader } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { LogoManager } from "@/components/admin/settings/logo-manager";

export default async function DesignSettingsPage() {
  await requirePermission("settings.edit");
  const config = await getConfig();

  return (
    <>
      <PageHeader eyebrow="Settings" title="Design" subtitle="Upload your logo and set its size. It replaces the placeholder box across the app." />
      <SettingsTabs />
      <LogoManager logoUrl={config.logoUrl} logoSize={config.logoSize} />
    </>
  );
}
