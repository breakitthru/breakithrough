"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMemberDpdp } from "@/lib/admin-member-actions";

export function DeleteMemberButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = () =>
    start(async () => {
      setError(null);
      const res = await deleteMemberDpdp(userId, note);
      if (!res.ok) { setError(res.error); return; }
      router.push("/admin/members");
    });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-[var(--radius-pill)] border border-[var(--color-crisis)] px-4 py-2 text-sm font-medium text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"
      >
        Delete account · DPDP
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--color-brand-ink)]/25" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-[440px] rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-float)]">
            <h3 className="font-display text-xl text-[var(--color-ink)]">Erase this account?</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              This nulls all personal data and erases the private journal and chat. Payment records
              are kept for legal reasons. A pseudonymous tombstone is created. This cannot be undone.
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason (optional, stored on the record)"
              rows={2}
              className="mt-3 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button>
              <button onClick={run} disabled={pending} className="rounded-[var(--radius-pill)] bg-[var(--color-crisis)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
                {pending ? "Erasing…" : "Erase account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
