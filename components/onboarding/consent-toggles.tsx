"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/actions";

type Key = "journal" | "chat" | "share" | "analytics";

const ITEMS: { key: Key; label: string; sub?: string; defaultOn: boolean }[] = [
  { key: "journal", label: "Store my journal entries", defaultOn: true },
  { key: "chat", label: "Store my AI chat", defaultOn: true },
  { key: "share", label: "Share a summary when I book", sub: "Off until you book — you approve it each time.", defaultOn: false },
  { key: "analytics", label: "Product analytics", defaultOn: false },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className="inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors"
      style={{ backgroundColor: on ? "var(--color-brand)" : "var(--color-line-strong)" }}
    >
      <span
        className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

export function ConsentToggles() {
  const router = useRouter();
  const [state, setState] = useState<Record<Key, boolean>>(
    Object.fromEntries(ITEMS.map((i) => [i.key, i.defaultOn])) as Record<Key, boolean>,
  );
  const [busy, setBusy] = useState(false);

  async function agree() {
    setBusy(true);
    await saveConsent({
      storeJournal: state.journal,
      storeChat: state.chat,
      shareSummaryOnBook: state.share,
      analytics: state.analytics,
    });
    router.push("/welcome/trusted-contact");
  }

  return (
    <div>
      <h1 className="font-display text-[2.75rem] leading-tight text-[var(--color-ink)]">
        Before we begin
      </h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        Here&rsquo;s exactly how we care for your privacy. Plain words — no fine print.
      </p>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <p className="eyebrow mb-4">You choose</p>
        <div className="space-y-4">
          {ITEMS.map((item) => (
            <div key={item.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-[var(--color-ink)]">{item.label}</p>
                {item.sub && <p className="text-sm text-[var(--color-ink-muted)]">{item.sub}</p>}
              </div>
              <Toggle
                on={state[item.key]}
                onClick={() => setState((s) => ({ ...s, [item.key]: !s[item.key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
        Change any of this whenever you like — Profile → Privacy.
        <br />
        Aligned with India&rsquo;s DPDP Act · <span className="font-medium underline">Read the full policy</span>
      </p>

      <Button variant="primary" size="lg" className="mt-6 w-full" onClick={agree} disabled={busy}>
        I agree — let&rsquo;s begin
      </Button>
    </div>
  );
}
