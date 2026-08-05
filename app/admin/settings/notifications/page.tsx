import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { setSettingsConfig } from "@/lib/admin-settings-actions";
import { PageHeader } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";
import { JsonEditor } from "@/components/admin/json-editor";

const DEFAULT_PREFS = {
  sosEvent: { email: true, inApp: true },
  paymentFailed: { email: true, inApp: true },
  redemptionRequested: { email: false, inApp: true },
  newMember: { email: false, inApp: false },
};

export default async function NotificationsSettingsPage() {
  await requirePermission("settings.edit");
  const row = await prisma.siteConfig.findUnique({ where: { key: "notificationPrefs" } });
  const prefs = row?.value ?? DEFAULT_PREFS;

  return (
    <>
      <PageHeader eyebrow="Settings" title="Notifications & alerts" subtitle="Which events reach staff, and how. An alert is not a rota." />
      <SettingsTabs />
      <JsonEditor
        initial={JSON.stringify(prefs, null, 2)}
        action={(value) => setSettingsConfig("notificationPrefs", value)}
        hint="Per-event email / in-app routing. Delivery wiring lands with the mail provider."
      />
    </>
  );
}
