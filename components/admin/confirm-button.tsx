"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Result = { ok: true } | { ok: false; error: string };

/*
  A button that runs a server action, optionally behind a confirm prompt, then
  refreshes server data. Used for delete/fulfil/refund/mark-reviewed actions.
*/
export function ConfirmButton({
  action,
  children,
  confirmTitle,
  confirmBody,
  confirmCta = "Confirm",
  className,
  onDone,
}: {
  action: () => Promise<Result>;
  children: React.ReactNode;
  confirmTitle?: string;
  confirmBody?: string;
  confirmCta?: string;
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      const res = await action();
      if (res && !res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      onDone?.();
      router.refresh();
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => (confirmTitle ? setOpen(true) : run())}
      >
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--color-brand-ink)]/25" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-[400px] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)]">
            <h3 className="font-display text-xl text-[var(--color-ink)]">{confirmTitle}</h3>
            {confirmBody && <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{confirmBody}</p>}
            {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
                Cancel
              </button>
              <button
                onClick={run}
                disabled={pending}
                className="rounded-[var(--radius-pill)] bg-[var(--color-crisis)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Working…" : confirmCta}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
