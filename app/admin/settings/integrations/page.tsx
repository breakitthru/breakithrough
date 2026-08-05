import { requirePermission } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";

function status(present: boolean) {
  return present ? <Chip tone="success">Connected</Chip> : <Chip tone="neutral">Not set</Chip>;
}

export default async function IntegrationsSettingsPage() {
  await requirePermission("settings.edit");

  const items = [
    { name: "Payment gateway (Razorpay)", crosses: "Card details never touch our servers; we store order/payment ids only.", present: !!process.env.RAZORPAY_KEY_ID },
    { name: "Google sign-in", crosses: "Email and name at sign-in, if a member chooses Google.", present: !!process.env.AUTH_GOOGLE_ID },
    { name: "Video hosting (Cloudflare Stream)", crosses: "Program videos and posters. No member data.", present: !!process.env.CLOUDFLARE_STREAM_TOKEN },
    { name: "Daylight (AI companion)", crosses: "Where a member's words would leave the building. Not wired yet.", present: !!process.env.DAYLIGHT_API_KEY },
  ];

  return (
    <>
      <PageHeader eyebrow="Settings" title="Integrations & keys" subtitle="Every third-party service and exactly what data crosses it. Secret values live in the environment and are never shown here." />
      <SettingsTabs />
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <Card key={it.name} className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-medium text-[var(--color-ink)]">{it.name}</p>
              <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{it.crosses}</p>
            </div>
            {status(it.present)}
          </Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--color-ink-faint)]">To connect or rotate a key, set the environment variable in the hosting dashboard and redeploy.</p>
    </>
  );
}
