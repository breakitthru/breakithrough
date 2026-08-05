import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { setOnCallRota } from "@/lib/admin-safety-actions";
import { PageHeader, Section } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { SafetyTabs } from "@/components/admin/safety/safety-tabs";
import { HelplineManager } from "@/components/admin/safety/helpline-manager";
import { JsonEditor } from "@/components/admin/json-editor";

const DEFAULT_ROTA = {
  timezone: "Asia/Kolkata",
  escalationHours: 2,
  shifts: [
    { day: "Mon", from: "09:00", to: "21:00", oncall: "" },
    { day: "Tue", from: "09:00", to: "21:00", oncall: "" },
  ],
};

export default async function OnCallPage() {
  await requirePermission("safety.view");
  const [helplines, rotaRow] = await Promise.all([
    prisma.helpline.findMany({ orderBy: { order: "asc" } }),
    prisma.siteConfig.findUnique({ where: { key: "onCallRota" } }),
  ]);
  const rota = rotaRow?.value ?? DEFAULT_ROTA;

  return (
    <>
      <PageHeader eyebrow="Safety" title="On-call & escalation" subtitle="Who covers SOS, and the helplines members are shown." />
      <SafetyTabs />

      <Card className="mb-6 border-[var(--color-caution)] bg-[var(--color-caution-subtle)]/40 p-4 text-sm text-[var(--color-ink)]">
        Automatic escalation is configured here but not yet fired by a background worker — treat the rota as the record of who is
        responsible, and review SOS events directly.
      </Card>

      <HelplineManager helplines={helplines} />

      <Section title="On-call rota">
        <JsonEditor
          initial={JSON.stringify(rota, null, 2)}
          action={setOnCallRota}
          hint="Free-form for now: shifts, escalation window, who is on call."
        />
      </Section>
    </>
  );
}
