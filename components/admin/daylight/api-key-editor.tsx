"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Result = { ok: true } | { ok: false; error: string };

/*
  Editor for the Daylight AI key. The real key never reaches the browser — the
  server passes only a masked hint (e.g. "sk-…bV3YA"). The input is a password
  field so the new key stays hidden as it's typed (toggle to reveal while
  pasting). Saving sends the new key to the server action; leaving it blank and
  saving clears the key (falls back to the environment variable).
*/
export function ApiKeyEditor({
  configured,
  maskedHint,
  action,
}: {
  configured: boolean;
  maskedHint: string | null;
  action: (key: string) => Promise<Result>;
}) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const save = () =>
    start(async () => {
      setError(null);
      setSaved(false);
      const res = await action(key.trim());
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setKey("");
      router.refresh();
    });

  return (
    <Card className="p-6">
      <h3 className="font-display text-lg text-[var(--color-ink)]">API key</h3>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        {configured ? (
          <>
            A key is set{maskedHint ? <> — <span className="font-mono">{maskedHint}</span></> : null}. Paste a new one below to
            replace it.
          </>
        ) : (
          <>No key set yet. Paste your OpenAI key (starts with &quot;sk-&quot;) to switch Daylight on.</>
        )}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={reveal ? "text" : "password"}
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setSaved(false);
            }}
            placeholder="sk-…"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] py-2.5 pl-3 pr-10 font-mono text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? "Hide key" : "Show key"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
          >
            {reveal ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Button size="sm" variant="primary" onClick={save} disabled={pending || !key.trim()}>
          {pending ? "Saving…" : "Save key"}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}
      {saved && !pending && <p className="mt-2 text-sm text-[var(--color-success)]">Key saved.</p>}

      <p className="mt-3 text-xs text-[var(--color-ink-faint)]">
        Stored securely and never shown again. Setting a key here overrides the environment variable.
      </p>
    </Card>
  );
}
