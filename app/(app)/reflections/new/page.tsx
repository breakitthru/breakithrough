import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireOnboardedUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { ReflectionEditor } from "@/components/app/reflection-editor";

export default async function NewReflectionPage() {
  await requireOnboardedUser();
  const { reflectionPrompt: PROMPT } = await getConfig();
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/reflections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Reflections
      </Link>

      <p className="eyebrow">Today&rsquo;s prompt</p>
      <h1 className="font-display mt-1 text-[1.9rem] leading-snug text-[var(--color-ink)]">
        {PROMPT}
      </h1>

      <ReflectionEditor prompt={PROMPT} />
    </div>
  );
}
