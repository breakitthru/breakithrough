"use client";

import { useEffect, useState } from "react";

/*
  Cookie preference centre. Opened from the footer link. Essential cookies are
  always on (needed to sign in); optional categories are opt-in and stored in
  localStorage. No non-essential cookies are set until the member opts in.
*/

const STORAGE_KEY = "bit-cookie-prefs";

type Prefs = { analytics: boolean };
const DEFAULTS: Prefs = { analytics: false };

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function CookiePreferencesLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Cookie Preferences
      </button>
      {open && <CookieDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function CookieDialog({ onClose }: { onClose: () => void }) {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnalytics(readPrefs().analytics);
  }, []);

  const save = (next: Prefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setSaved(true);
    setTimeout(onClose, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >
      <div
        className="w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-[1.4rem] text-[var(--color-ink)]">Cookie preferences</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          We use a small number of cookies to keep you signed in and to understand how the programme is used. You choose
          what&rsquo;s optional.
        </p>

        <div className="mt-5 space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-ink)]">Essential</span>
              <span className="text-xs font-medium text-[var(--color-ink-faint)]">Always on</span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Needed to sign you in and remember your session. The site can&rsquo;t work without these.
            </p>
          </div>

          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-line)] p-4">
            <span>
              <span className="text-sm font-medium text-[var(--color-ink)]">Analytics</span>
              <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">
                Anonymous usage data that helps us improve the programme. Off by default.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand)]"
            />
          </label>
        </div>

        {saved && <p className="mt-3 text-sm text-[var(--color-success)]">Saved.</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save({ analytics })}
            className="rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={() => {
              setAnalytics(true);
              save({ analytics: true });
            }}
            className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-sunken)]"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-2 py-2 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
