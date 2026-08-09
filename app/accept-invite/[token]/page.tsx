import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { AcceptInvite } from "@/components/admin/staff/accept-invite";

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await requireUser(); // must be signed in first
  const invite = await prisma.staffInvite.findUnique({ where: { token } });

  const valid = invite && !invite.acceptedAt && invite.expiresAt > new Date();
  const emailMatches = valid && user.email && user.email.toLowerCase() === invite!.email.toLowerCase();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[460px] flex-col justify-center px-6 py-10">
      <p className="eyebrow">Break It Thru · Staff</p>
      <h1 className="font-display mt-1 text-[2.25rem] leading-tight text-[var(--color-ink)]">Join the team.</h1>
      <Card className="mt-6 p-6">
        {!valid ? (
          <p className="text-sm text-[var(--color-ink-muted)]">This invite is invalid or has expired. Ask whoever invited you for a fresh link.</p>
        ) : !emailMatches ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            This invite is for <span className="font-medium text-[var(--color-ink)]">{invite!.email}</span>. Sign in with that account to accept it.
            <Link href="/login" className="mt-3 block text-[var(--color-accent)] hover:underline">Switch account →</Link>
          </p>
        ) : (
          <AcceptInvite token={token} role={invite!.staffRole} email={invite!.email} />
        )}
      </Card>
    </div>
  );
}
