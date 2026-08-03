"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveReflection } from "@/lib/actions";

export function ReflectionEditor({ prompt }: { prompt: string }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    const res = await saveReflection({ prompt, body });
    // On success the action redirects; if it returns, it failed.
    if (res && !res.ok) {
      setBusy(false);
      setError(res.error ?? "Could not save");
    }
  }

  return (
    <>
      <textarea
        autoFocus
        rows={14}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write anything. No one else sees this."
        className="mt-6 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />
      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--color-ink-faint)]">Private to you</span>
        <Button variant="primary" onClick={save} disabled={busy || !body.trim()}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </>
  );
}
