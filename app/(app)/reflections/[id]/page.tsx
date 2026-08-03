import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default async function ReadReflectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/reflections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Reflections
      </Link>
      <p className="eyebrow">Day 11 · 20 Jul</p>
      <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--color-ink)]">
        Placeholder reflection body. Real entries are private to the user and stored encrypted.
      </p>
    </div>
  );
}
