"use client";

import { useState } from "react";

/**
 * On/off switch. Uncontrolled by default (defaultOn); pass `checked` + `onChange`
 * to control it (used by admin editors).
 *
 * Colours are set with inline styles (not Tailwind arbitrary values) so the
 * on/off state always paints — `bg-[var(--token)]` can silently fail to generate.
 */
export function Toggle({
  defaultOn = false,
  checked,
  onChange,
  disabled,
}: {
  defaultOn?: boolean;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}) {
  const [internal, setInternal] = useState(defaultOn);
  const on = checked ?? internal;
  const toggle = () => {
    const next = !on;
    onChange?.(next);
    if (checked === undefined) setInternal(next);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{ backgroundColor: on ? "var(--color-brand)" : "var(--color-line-strong)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}
