"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Result = { ok: true } | { ok: false; error: string };

/* Freeform textarea editor for a single SiteConfig string (Daylight's system prompt). */
export function PromptEditor({
  initial,
  action,
  hint,
}: {
  initial: string;
  action: (value: unknown) => Promise<Result>;
  hint?: string;
}) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      if (!text.trim()) { setError("The prompt can't be empty."); return; }
      const res = await action(text.trim());
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      router.refresh();
    });

  return (
    <Card className="p-6">
      {hint && <p className="mb-3 text-sm text-[var(--color-ink-muted)]">{hint}</p>}
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        rows={12}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] p-4 text-sm leading-relaxed text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />
      {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        {saved && !pending && <span className="text-sm text-[var(--color-success)]">Saved.</span>}
      </div>
    </Card>
  );
}
