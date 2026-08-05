"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/admin/drawer";

type Result = { ok: true } | { ok: false; error: string };
export type ConfigField = {
  key: string;
  label: string;
  hint?: string;
  value: number | string | null;
  kind?: "number" | "text";
};

/*
  Edits a set of SiteConfig values. On save, writes only changed keys via the
  passed action (scoped to the caller's permission), then refreshes.
*/
export function ConfigEditor({
  fields,
  action,
}: {
  fields: ConfigField[];
  action: (key: string, value: unknown) => Promise<Result>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value === null ? "" : String(f.value)])),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      for (const f of fields) {
        const raw = values[f.key];
        const original = f.value === null ? "" : String(f.value);
        if (raw === original) continue;
        const parsed = f.kind === "text" ? (raw === "" ? null : raw) : raw === "" ? null : Number(raw);
        const res = await action(f.key, parsed);
        if (!res.ok) { setError(res.error); return; }
      }
      setSaved(true);
      router.refresh();
    });

  return (
    <Card className="max-w-xl p-6">
      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="eyebrow mb-1.5 block">{f.label}</span>
            <input
              className={inputClass}
              type={f.kind === "text" ? "text" : "number"}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            />
            {f.hint && <span className="mt-1 block text-xs text-[var(--color-ink-faint)]">{f.hint}</span>}
          </label>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-5 flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {saved && !pending && <span className="text-sm text-[var(--color-success)]">Saved.</span>}
      </div>
    </Card>
  );
}
