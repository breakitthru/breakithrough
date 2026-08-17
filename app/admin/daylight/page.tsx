import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { getConfig } from "@/lib/config";
import { getAiSettings } from "@/lib/ai";
import { setSettingsConfig, setAiApiKey } from "@/lib/admin-settings-actions";
import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PromptEditor } from "@/components/admin/daylight/prompt-editor";
import { ApiKeyEditor } from "@/components/admin/daylight/api-key-editor";

const OPENAI_BILLING_URL = "https://platform.openai.com/settings/organization/billing/overview";
const OPENAI_USAGE_URL = "https://platform.openai.com/usage";

/** Mask a secret key for display: keep the "sk-" prefix and last 4 chars only. */
function maskKey(key: string): string | null {
  if (!key) return null;
  const last = key.slice(-4);
  return `sk-…${last}`;
}

export default async function AdminDaylightPage() {
  await requirePermission("settings.edit");
  const config = await getConfig();
  const { apiKey, model } = await getAiSettings();
  const connected = Boolean(apiKey);

  return (
    <>
      <PageHeader eyebrow="Daylight" title="AI companion" subtitle="The always-on chat companion members can talk to. Shape its voice, set the key, and manage credits here." />

      <Card className={`mb-6 p-4 text-sm ${connected ? "" : "border-[var(--color-caution)] bg-[var(--color-caution-subtle)]/40"}`}>
        {connected ? (
          <>Daylight is connected and live for members. Model: <span className="font-mono">{model}</span>.</>
        ) : (
          <>Daylight isn&apos;t connected yet — add an OpenAI key below to switch it on. The prompt is saved either way.</>
        )}
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ApiKeyEditor configured={connected} maskedHint={maskKey(apiKey)} action={setAiApiKey} />

        {/* Credits & usage — OpenAI doesn't expose the prepaid balance to app keys,
            so this links out to the dashboard rather than showing a live number. */}
        <Card className="flex flex-col p-6">
          <h3 className="font-display text-lg text-[var(--color-ink)]">Credits &amp; usage</h3>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Daylight runs on pay-as-you-go OpenAI credits. When the balance runs low, replies stop until you top up.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={OPENAI_BILLING_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "primary", size: "sm" })}>
              Add credits <ArrowSquareOut size={16} />
            </a>
            <a href={OPENAI_USAGE_URL} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
              View usage <ArrowSquareOut size={16} />
            </a>
          </div>
          <p className="mt-auto pt-4 text-xs text-[var(--color-ink-faint)]">
            The live balance and spend live on OpenAI&apos;s dashboard — they aren&apos;t available to the app through a
            standard key. Set a monthly limit there so it can never overspend.
          </p>
        </Card>
      </div>

      <PromptEditor
        initial={config.daylightSystemPrompt}
        action={setSettingsConfig.bind(null, "daylightSystemPrompt")}
        hint="The system prompt that defines Daylight's personality and safety rules. Members never see this text — it guides how the AI responds. Keep the crisis-safety guidance in place."
      />
    </>
  );
}
