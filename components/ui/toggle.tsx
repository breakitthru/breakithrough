"use client";

import { useState } from "react";

/**
 * On/off switch. Uncontrolled by default (defaultOn); pass `checked` + `onChange`
 * to control it (used by admin editors).
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
      onClick={toggle}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-[var(--color-brand)]" : "bg-[var(--color-line-strong)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
