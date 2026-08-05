"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/admin/drawer";
import { createInvite } from "@/lib/admin-staff-actions";
import type { StaffRole } from "@prisma/client";

const ROLES: StaffRole[] = ["OPS", "CLINICIAN", "MODERATOR", "SPECIALIST"];

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("OPS");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setError(null);
      setLink(null);
      const res = await createInvite(email, role);
      if (!res.ok) { setError(res.error); return; }
      setLink(res.link);
    });

  return (
    <Card className="max-w-lg p-6">
      <Field label="Email"><input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></Field>
      <Field label="Role">
        <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {ROLES.map((r) => <option key={r} value={r}>{r[0] + r.slice(1).toLowerCase()}</option>)}
        </select>
      </Field>
      {error && <p className="mb-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <Button size="sm" variant="primary" onClick={submit} disabled={pending || !email}>
        {pending ? "Creating…" : "Create invite"}
      </Button>

      {link && (
        <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4">
          <p className="text-sm font-medium text-[var(--color-ink)]">Invite ready.</p>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Email delivery isn&rsquo;t wired yet — send this link to them. They sign in with the invited email and accept.
          </p>
          <input readOnly value={link} onClick={(e) => e.currentTarget.select()} className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 py-2 font-mono text-xs text-[var(--color-ink)]" />
        </div>
      )}
    </Card>
  );
}
