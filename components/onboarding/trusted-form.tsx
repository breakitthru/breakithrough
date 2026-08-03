"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveTrustedContact } from "@/lib/actions";

export function TrustedForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(skip: boolean) {
    setBusy(true);
    await saveTrustedContact(skip ? "" : name, skip ? "" : phone);
    router.push("/welcome/why");
  }

  return (
    <div>
      <h1 className="font-display text-[2.5rem] leading-tight text-[var(--color-ink)]">
        Someone you trust
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        We&rsquo;ll only ever show this to you, as a call button. Never messaged, never shared.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="eyebrow">Their name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya"
            className="mt-2 h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>
        <label className="block">
          <span className="eyebrow">Their number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 …"
            className="mt-2 h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => go(true)}
          disabled={busy}
          className="text-sm text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
        <Button variant="primary" onClick={() => go(false)} disabled={busy}>
          Continue
        </Button>
      </div>
    </div>
  );
}
