import Link from "next/link";
import { Bell, Trophy, Gift } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function iconFor(type: string) {
  if (type === "badge") return Trophy;
  if (type === "reward") return Gift;
  return Bell;
}

function relativeDay(d: Date) {
  const day = 86_400_000;
  const diff = Math.floor((Date.now() - d.getTime()) / day);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function NotificationsPage() {
  const user = await requireOnboardedUser();
  const notes = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  // Mark everything read now that the user is looking at the list.
  if (notes.some((n) => !n.read)) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <header className="mb-8">
        <p className="eyebrow">Notifications</p>
        <h1 className="font-display mt-1 text-[2.5rem] leading-tight text-[var(--color-ink)]">
          What&rsquo;s new.
        </h1>
      </header>

      {notes.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]">
            <Bell size={22} />
          </span>
          <p className="text-[var(--color-ink-muted)]">Nothing new yet. Keep showing up.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((n) => {
            const Icon = iconFor(n.type);
            const body = (
              <Card
                className={`flex items-start gap-4 p-5 ${
                  n.actionUrl ? "transition-colors hover:border-[var(--color-line-strong)]" : ""
                }`}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
                  <Icon size={18} weight="fill" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-ink)]">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{n.body}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[var(--color-ink-faint)]">
                  {relativeDay(n.createdAt)}
                </span>
              </Card>
            );
            return n.actionUrl ? (
              <Link key={n.id} href={n.actionUrl}>
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
