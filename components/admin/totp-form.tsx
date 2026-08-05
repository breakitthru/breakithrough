"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

/*
  Six-digit TOTP entry. The action redirects on success (so it never returns);
  on failure it returns { ok:false, error }. Used by enroll + verify pages.
*/
export function TotpForm({
  action,
  cta,
}: {
  action: (code: string) => Promise<{ ok: false; error: string }>;
  cta: string;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await action(code);
          if (res && !res.ok) setError(res.error);
        });
      }}
      className="flex flex-col gap-3"
    >
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="123456"
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-3 text-center text-lg tracking-[0.4em] text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />
      {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      <Button type="submit" variant="primary" size="lg" disabled={code.length !== 6 || pending}>
        {pending ? "Checking…" : cta}
      </Button>
    </form>
  );
}
