"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Result = { ok: true } | { ok: false; error: string };

/* Generic JSON blob editor (on-call rota, etc.). Validates JSON before saving. */
export function JsonEditor({
  initial,
  action,
  hint,
  rows = 14,
}: {
  initial: string;
  action: (value: unknown) => Promise<Result>;
  hint?: string;
  rows?: number;
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
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        setError("That isn't valid JSON.");
        return;
      }
      const res = await action(parsed);
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      router.refresh();
    });

  return (
    <Card className="p-6">
      {hint && <p className="mb-3 text-sm text-[var(--color-ink-muted)]">{hint}</p>}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={rows}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] p-4 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />
      {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={save} disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        {saved && !pending && <span className="text-sm text-[var(--color-success)]">Saved.</span>}
      </div>
    </Card>
  );
}
