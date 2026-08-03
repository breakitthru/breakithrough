import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

export default function NewReflectionPage() {
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/reflections"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Reflections
      </Link>

      <p className="eyebrow">Today&rsquo;s prompt</p>
      <h1 className="font-display mt-1 text-[1.9rem] leading-snug text-[var(--color-ink)]">
        What&rsquo;s one thing you noticed today?
      </h1>

      <textarea
        autoFocus
        rows={14}
        placeholder="Write anything. No one else sees this."
        className="mt-6 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
      />

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-[var(--color-ink-faint)]">Autosaves as you write</span>
        <Button variant="primary">Save</Button>
      </div>
    </div>
  );
}
