"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setConfigValue } from "@/lib/admin-program-actions";

/*
  Structured JSON editor for the intake questions. Kept as JSON for v1 — it's a
  small, technical surface and gives full control (titles, options, order).
*/
export function IntakeEditor({ initial }: { initial: string }) {
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
      if (!Array.isArray(parsed)) {
        setError("Expected a list of questions.");
        return;
      }
      const res = await setConfigValue("intakeQuestions", parsed);
      if (!res.ok) { setError(res.error); return; }
      setSaved(true);
      router.refresh();
    });

  return (
    <Card className="p-6">
      <p className="mb-3 text-sm text-[var(--color-ink-muted)]">
        Each question has <code>step</code>, <code>title</code>, <code>subtitle</code>, <code>footnote</code> and{" "}
        <code>options</code> (each with <code>value</code>, <code>label</code>, <code>icon</code>).
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={22}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] p-4 font-mono text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />
      {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save questions"}
        </Button>
        {saved && !pending && <span className="text-sm text-[var(--color-success)]">Saved.</span>}
      </div>
    </Card>
  );
}
