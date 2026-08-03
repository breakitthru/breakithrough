"use client";

import { signOut } from "next-auth/react";
import { SignOut as SignOutIcon } from "@phosphor-icons/react";

export function SignOutRow() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-sunken)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-crisis-subtle)] text-[var(--color-crisis)]">
        <SignOutIcon size={18} />
      </span>
      <span className="font-medium text-[var(--color-crisis)]">Sign out</span>
    </button>
  );
}
