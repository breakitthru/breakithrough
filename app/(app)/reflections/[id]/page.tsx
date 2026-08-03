import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function ReadReflectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboardedUser();
  const entry = await prisma.reflection.findUnique({ where: { id } });
  // Only the owner can read it — the privacy wall.
  if (!entry || entry.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/reflections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Reflections
      </Link>
      <p className="eyebrow">
        {entry.dayNumber ? `Day ${entry.dayNumber} · ` : ""}
        {entry.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      {entry.prompt && (
        <h1 className="font-display mt-2 text-2xl leading-snug text-[var(--color-ink)]">
          {entry.prompt}
        </h1>
      )}
      <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--color-ink)]">{entry.body}</p>
    </div>
  );
}
