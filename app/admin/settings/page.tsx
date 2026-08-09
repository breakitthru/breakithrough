import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";
import { setSettingsConfig } from "@/lib/admin-settings-actions";
import { PageHeader } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { ConfigEditor } from "@/components/admin/config-editor";

async function readKeys(keys: string[]): Promise<Record<string, string>> {
  const rows = await prisma.siteConfig.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((r) => [r.key, typeof r.value === "string" ? r.value : JSON.stringify(r.value)]));
}

export default async function WorkspaceSettingsPage() {
  await requirePermission("settings.edit");
  const config = await getConfig();
  const extra = await readKeys(["workspaceName", "supportEmail"]);

  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace & brand" subtitle="The basics: name, support address, timezone and the day boundary." />
      <SettingsTabs />
      <ConfigEditor
        action={setSettingsConfig}
        fields={[
          { key: "workspaceName", label: "Workspace name", value: extra.workspaceName ?? "Break It Thru", kind: "text" },
          { key: "supportEmail", label: "Support email", value: extra.supportEmail ?? "", kind: "text" },
          { key: "timezone", label: "Timezone", value: config.timezone, kind: "text" },
          { key: "currency", label: "Currency", value: config.currency, kind: "text" },
          { key: "dayRolloverHour", label: "Day rollover hour (IST, 0–23)", value: config.dayRolloverHour },
        ]}
      />
    </>
  );
}
