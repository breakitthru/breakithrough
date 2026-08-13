import { requirePermission } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { isAiConfigured } from "@/lib/ai";
import { setSettingsConfig } from "@/lib/admin-settings-actions";
import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { PromptEditor } from "@/components/admin/daylight/prompt-editor";

export default async function AdminDaylightPage() {
  await requirePermission("settings.edit");
  const config = await getConfig();

  return (
    <>
      <PageHeader eyebrow="Daylight" title="AI companion" subtitle="The always-on chat companion members can talk to. Shape its voice and guardrails here." />

      <Card className={`mb-6 p-4 text-sm ${isAiConfigured ? "" : "border-[var(--color-caution)] bg-[var(--color-caution-subtle)]/40"}`}>
        {isAiConfigured
          ? "Daylight is connected and live for members."
          : "Daylight isn't connected yet — add the AI provider key (AI_API_KEY) in the environment to switch it on. The prompt below is saved either way."}
      </Card>

      <PromptEditor
        initial={config.daylightSystemPrompt}
        action={setSettingsConfig.bind(null, "daylightSystemPrompt")}
        hint="The system prompt that defines Daylight's personality and safety rules. Members never see this text — it guides how the AI responds. Keep the crisis-safety guidance in place."
      />
    </>
  );
}
