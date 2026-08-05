"use client";

import * as React from "react";
import { X } from "@phosphor-icons/react";

/* Right-side slide-over used for editors (tasks, rewards, helplines, staff…). */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[var(--color-brand-ink)]/20" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-[var(--color-surface)] shadow-[var(--shadow-float)]">
        <header className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
          <h2 className="font-display text-xl text-[var(--color-ink)]">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="border-t border-[var(--color-line)] px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

/* Small labelled field wrappers used inside drawers. */
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-4 block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--color-ink-faint)]">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]";
