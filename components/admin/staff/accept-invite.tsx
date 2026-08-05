"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/admin-staff-actions";

export function AcceptInvite({ token, role, email }: { token: string; role: string; email: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const accept = () =>
    start(async () => {
      setError(null);
      const res = await acceptInvite(token);
      if (!res.ok) { setError(res.error); return; }
      router.push("/admin/security/enroll");
    });

  return (
    <div>
      <p className="text-sm text-[var(--color-ink-muted)]">
        You&rsquo;ve been invited to join Break It Through as <span className="font-medium text-[var(--color-ink)]">{role[0] + role.slice(1).toLowerCase()}</span> ({email}).
        Accept to get access, then set up two-factor.
      </p>
      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <Button size="lg" variant="primary" onClick={accept} disabled={pending} className="mt-5 w-full">
        {pending ? "Accepting…" : "Accept invite"}
      </Button>
    </div>
  );
}
