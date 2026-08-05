import Link from "next/link";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return <PageHeader eyebrow="Search" title="Search" subtitle="Find members, staff, or a program day. Type in the bar above." />;
  }

  const dayNum = /^\d+$/.test(query) ? Number(query) : null;
  const [people] = await Promise.all([
    prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 25,
      select: { id: true, displayName: true, name: true, email: true, staffRole: true },
    }),
  ]);

  const members = people.filter((p) => !p.staffRole);
  const staff = people.filter((p) => p.staffRole);
  const nothing = members.length === 0 && staff.length === 0 && !(dayNum && dayNum >= 1 && dayNum <= 60);

  return (
    <>
      <PageHeader eyebrow="Search" title={`Results for "${query}"`} />
      {nothing ? (
        <EmptyState title="Nothing found." body="Try a name, an email, or a day number." />
      ) : (
        <div className="flex flex-col gap-6">
          {dayNum && dayNum >= 1 && dayNum <= 60 && (
            <section>
              <p className="eyebrow mb-2">Program</p>
              <Card className="p-0">
                <Link href={`/admin/program/day/${dayNum}`} className="block px-5 py-3 hover:bg-[var(--color-surface-sunken)]/40">
                  Day {dayNum} editor →
                </Link>
              </Card>
            </section>
          )}
          {members.length > 0 && (
            <section>
              <p className="eyebrow mb-2">Members</p>
              <Card className="p-0">
                {members.map((m) => (
                  <Link key={m.id} href={`/admin/members/${m.id}`} className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3 last:border-0 hover:bg-[var(--color-surface-sunken)]/40">
                    <span className="text-[var(--color-ink)]">{m.displayName ?? m.name ?? "Member"}</span>
                    <span className="text-sm text-[var(--color-ink-faint)]">{m.email ?? "—"}</span>
                  </Link>
                ))}
              </Card>
            </section>
          )}
          {staff.length > 0 && (
            <section>
              <p className="eyebrow mb-2">Staff</p>
              <Card className="p-0">
                {staff.map((s) => (
                  <div key={s.id} className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-3 last:border-0">
                    <span className="text-[var(--color-ink)]">{s.displayName ?? s.name ?? s.email}</span>
                    <Chip tone="brand">{s.staffRole?.[0] + (s.staffRole?.slice(1).toLowerCase() ?? "")}</Chip>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </>
  );
}
