"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveWhy } from "@/lib/actions";

export function WhyForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(skip: boolean) {
    setBusy(true);
    await saveWhy(skip ? "" : text);
    router.push("/welcome/start");
  }

  return (
    <div>
      <h1 className="font-display text-[2.5rem] leading-tight text-[var(--color-ink)]">
        In your own words
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        A sentence or two. There&rsquo;s no right way to say it.
      </p>

      <textarea
        autoFocus
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I started because…"
        className="mt-6 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />

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
