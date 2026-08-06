import { requirePermission } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { setConfigValue } from "@/lib/admin-program-actions";
import { PageHeader } from "@/components/admin/ui";
import { ProgramTabs } from "@/components/admin/program/program-tabs";
import { ConfigEditor } from "@/components/admin/config-editor";

export default async function RulesPage() {
  await requirePermission("program.edit");
  const config = await getConfig();

  return (
    <>
      <PageHeader eyebrow="Program" title="Rules" subtitle="Cadence, points and the day boundary. These take effect for members immediately." />
      <ProgramTabs />
      <ConfigEditor
        action={setConfigValue}
        fields={[
          { key: "trialDays", label: "Free trial days", value: config.trialDays, hint: "Days 1–N are free; the paywall appears after." },
          { key: "pointsPerTask", label: "Points per task", value: config.pointsPerTask },
          { key: "dayCompleteBonus", label: "Bonus for finishing a day", value: config.dayCompleteBonus },
          { key: "reflectionPoints", label: "Points per reflection (max 1/day)", value: config.reflectionPoints },
          { key: "reflectionPrompt", label: "Daily reflection prompt", value: config.reflectionPrompt, kind: "text", hint: "The question members see when writing today's reflection." },
          { key: "sosRideOutPoints", label: "Points for riding out an urge (max 1/day)", value: config.sosRideOutPoints },
          { key: "dayRolloverHour", label: "Day rollover hour (IST, 0–23)", value: config.dayRolloverHour, hint: "The hour a new program day begins. 0 = midnight." },
        ]}
      />
    </>
  );
}
