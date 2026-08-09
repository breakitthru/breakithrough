import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { markSosReviewed } from "@/lib/admin-safety-actions";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/admin/confirm-button";

const DOOR_LABEL: Record<string, string> = { NOT_SAFE: "I'm not safe", RIDE_OUT: "About to relapse", TALK: "Need to talk" };

export default async function SosEventPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission("safety.view");
  const { id } = await params;
  const event = await prisma.sosEvent.findUnique({
    where: { id },
    include: { user: { select: { id: true, displayName: true, name: true } } },
  });
  if (!event) notFound();
  const canAct = admin.effectiveRole === "OWNER" || admin.effectiveRole === "OPS" || admin.effectiveRole === "MODERATOR";

  return (
    <>
      <Link href="/admin/safety" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> SOS log
      </Link>
      <PageHeader
        eyebrow="Safety · event"
        title={DOOR_LABEL[event.door] ?? event.door}
        subtitle={event.createdAt.toLocaleString("en-IN", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
        actions={<StatusPill status={event.reviewedAt ? "REVIEWED" : "OPEN"} label={event.reviewedAt ? "reviewed" : "needs review"} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-6">
          <h3 className="font-semibold text-[var(--color-ink)]">What you know</h3>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Member</dt><dd>{event.user ? <Link href={`/admin/members/${event.user.id}`} className="hover:underline">{event.user.displayName ?? event.user.name ?? "Member"}</Link> : "Logged out"}</dd></div>
            <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Door pressed</dt><dd>{DOOR_LABEL[event.door] ?? event.door}</dd></div>
            <div className="flex justify-between border-b border-[var(--color-line)] py-1.5"><dt className="text-[var(--color-ink-muted)]">Rode out the urge</dt><dd>{event.rodeOut ? "Yes" : "—"}</dd></div>
            <div className="flex justify-between py-1.5"><dt className="text-[var(--color-ink-muted)]">Reviewed</dt><dd>{event.reviewedAt ? event.reviewedAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Not yet"}</dd></div>
          </dl>
          <p className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] p-4 text-sm text-[var(--color-ink-muted)]">
            What this record cannot tell you: whether they are safe now, what they wrote to Daylight, or what happened after
            they closed the app. Treat it as a prompt to reach out, not a full picture.
          </p>
        </Card>

        <aside>
          <Card className="p-5">
            <h3 className="font-semibold text-[var(--color-ink)]">Act</h3>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Marking reviewed records that a human has seen this.</p>
            {event.reviewedAt ? (
              <p className="mt-4 text-sm text-[var(--color-success)]">Reviewed.</p>
            ) : canAct ? (
              <ConfirmButton
                action={markSosReviewed.bind(null, event.id)}
                className="mt-4 w-full rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]"
              >
                Mark reviewed
              </ConfirmButton>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-ink-faint)]">You don&rsquo;t have permission to act on events.</p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
