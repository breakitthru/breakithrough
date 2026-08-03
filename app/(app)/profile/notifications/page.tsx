import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

// Notification settings (D83). No phone/WhatsApp in scope — email + in-app only.
const rows = [
  { label: "Daily gentle reminder", sub: "A nudge to open today.", on: true },
  { label: "Session reminders", sub: "Before a booked 1:1.", on: true },
  { label: "Reward & badge updates", sub: "When you earn something.", on: true },
  { label: "Quiet hours", sub: "Nothing between 10pm and 8am.", on: true },
];

const channels = [
  { label: "In-app", on: true },
  { label: "Email", on: true },
];

export default function NotificationSettingsPage() {
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Profile
      </Link>

      <p className="eyebrow">Notifications</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        Only what helps.
      </h1>

      <Card className="mt-6 p-6">
        <p className="eyebrow mb-4">What we send</p>
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-[var(--color-ink)]">{r.label}</p>
                <p className="text-sm text-[var(--color-ink-muted)]">{r.sub}</p>
              </div>
              <Toggle defaultOn={r.on} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <p className="eyebrow mb-4">Where we send it</p>
        <div className="space-y-4">
          {channels.map((c) => (
            <div key={c.label} className="flex items-center justify-between">
              <p className="font-medium text-[var(--color-ink)]">{c.label}</p>
              <Toggle defaultOn={c.on} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
