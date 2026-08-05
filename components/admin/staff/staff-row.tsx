"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/card";
import { setStaffRole } from "@/lib/admin-staff-actions";
import type { StaffRole } from "@prisma/client";

const ROLES: StaffRole[] = ["OWNER", "OPS", "CLINICIAN", "MODERATOR", "SPECIALIST"];

export function StaffRow({
  id,
  name,
  email,
  role,
  twoFa,
  isOwnerEmail,
}: {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  twoFa: boolean;
  isOwnerEmail: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const change = (next: StaffRole | null) =>
    start(async () => {
      await setStaffRole(id, next);
      router.refresh();
    });

  return (
    <tr className="border-b border-[var(--color-line)] last:border-0">
      <td className="px-5 py-3">
        <p className="font-medium text-[var(--color-ink)]">{name}</p>
        <p className="text-xs text-[var(--color-ink-faint)]">{email}</p>
      </td>
      <td className="px-3 py-3">
        {isOwnerEmail ? (
          <Chip tone="brand">Owner</Chip>
        ) : (
          <select
            value={role}
            disabled={pending}
            onChange={(e) => change(e.target.value as StaffRole)}
            className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r[0] + r.slice(1).toLowerCase()}</option>)}
          </select>
        )}
      </td>
      <td className="px-3 py-3">
        {twoFa ? <Chip tone="success">on</Chip> : <Chip tone="caution">pending</Chip>}
      </td>
      <td className="px-3 py-3 text-right">
        {!isOwnerEmail && (
          <button
            disabled={pending}
            onClick={() => change(null)}
            className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-3 py-1.5 text-xs text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"
          >
            Suspend
          </button>
        )}
      </td>
    </tr>
  );
}
