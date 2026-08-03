import { Bell } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";

const notes = [
  { id: "n1", title: "Day 12 is ready", body: "Three small things, whenever you're ready.", when: "Today" },
  { id: "n2", title: "You earned a badge", body: "11-day streak — quietly proud of you.", when: "Yesterday" },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[680px]">
      <header className="mb-8">
        <p className="eyebrow">Notifications</p>
        <h1 className="font-display mt-1 text-[2.5rem] leading-tight text-[var(--color-ink)]">
          What&rsquo;s new.
        </h1>
      </header>
      <div className="flex flex-col gap-3">
        {notes.map((n) => (
          <Card key={n.id} className="flex items-start gap-4 p-5">
            <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
              <Bell size={18} weight="fill" />
            </span>
            <div className="flex-1">
              <p className="font-medium text-[var(--color-ink)]">{n.title}</p>
              <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{n.body}</p>
            </div>
            <span className="text-xs text-[var(--color-ink-faint)]">{n.when}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
