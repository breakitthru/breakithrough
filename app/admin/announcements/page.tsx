import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, Section, EmptyState } from "@/components/admin/ui";
import { AnnouncementComposer } from "@/components/admin/announcements/composer";

function timeAgo(d: Date) {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function AnnouncementsPage() {
  await requirePermission("notify.send");

  const recent = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { displayName: true, name: true, email: true } } },
  });

  return (
    <>
      <PageHeader
        eyebrow="Members"
        title="Announcements"
        subtitle="Send an in-app notification to members. It appears in their notifications feed immediately (no email is sent)."
      />

      <AnnouncementComposer />

      <div className="mt-8">
        <Section title="Recently sent">
          {recent.length === 0 ? (
            <EmptyState title="Nothing sent yet." body="Notifications you send will show here." />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-surface-sunken)] text-left text-[var(--color-ink-muted)]">
                  <tr>
                    <th className="px-3 py-3 font-medium">When</th>
                    <th className="px-3 py-3 font-medium">To</th>
                    <th className="px-3 py-3 font-medium">Kind</th>
                    <th className="px-3 py-3 font-medium">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((n) => (
                    <tr key={n.id} className="border-t border-[var(--color-line)]">
                      <td className="whitespace-nowrap px-3 py-3 text-[var(--color-ink-muted)]">{timeAgo(n.createdAt)}</td>
                      <td className="px-3 py-3 text-[var(--color-ink)]">{n.user?.displayName ?? n.user?.name ?? n.user?.email ?? "—"}</td>
                      <td className="px-3 py-3 text-[var(--color-ink-muted)]">{n.type}</td>
                      <td className="px-3 py-3 text-[var(--color-ink)]">{n.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
