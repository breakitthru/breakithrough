import Link from "next/link";
import { NotePencil, PenNib, LockSimple } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Reflections entries. Empty by default (fresh Day-1 account) → D33 empty state.
// When real data is wired, populate `entries` from the user's saved reflections.
const entries: { id: string; day: number; date: string; preview: string }[] = [];

export default function ReflectionsPage() {
  const isEmpty = entries.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[760px] flex-col">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow">Your notebook</p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            Your reflections
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)]">
            <LockSimple size={14} /> A private place to put things down.
          </p>
        </div>
        {!isEmpty && (
          <Link href="/reflections/new">
            <Button variant="accent">
              <NotePencil size={18} /> Write
            </Button>
          </Link>
        )}
      </header>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
            <PenNib size={28} />
          </span>
          <h2 className="font-display mt-6 text-2xl text-[var(--color-ink)]">Nothing written yet.</h2>
          <p className="mt-2 max-w-sm text-[var(--color-ink-muted)]">
            This is yours alone — nobody else can read it. Start with one line, even a bad one.
          </p>
          <Link href="/reflections/new" className="mt-8">
            <Button variant="primary" size="lg">
              Write your first reflection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((e) => (
            <Link key={e.id} href={`/reflections/${e.id}`}>
              <Card className="flex items-center justify-between p-5 transition-colors hover:border-[var(--color-line-strong)]">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{e.preview}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    Day {e.day} · {e.date}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
