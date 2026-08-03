import Link from "next/link";
import { ArrowLeft, DownloadSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

// Privacy center (D82) — what's shared, download my data, delete my account.
const controls = [
  { label: "Store my journal entries", sub: "Encrypted, private to you.", on: true },
  { label: "Store my Daylight chat", sub: "Private to you.", on: true },
  { label: "Share a summary when I book", sub: "Off until you book — approved each time.", on: false },
  { label: "Product analytics", sub: "Helps us improve the app.", on: false },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Profile
      </Link>

      <p className="eyebrow">Privacy center</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        You control your data.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        Aligned with India&rsquo;s DPDP Act. Change anything, anytime.
      </p>

      <Card className="mt-6 p-6">
        <p className="eyebrow mb-4">What&rsquo;s stored &amp; shared</p>
        <div className="space-y-4">
          {controls.map((c) => (
            <div key={c.label} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-[var(--color-ink)]">{c.label}</p>
                <p className="text-sm text-[var(--color-ink-muted)]">{c.sub}</p>
              </div>
              <Toggle defaultOn={c.on} />
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-3">
        <button className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4 text-left transition-colors hover:border-[var(--color-line-strong)]">
          <DownloadSimple size={20} className="text-[var(--color-ink-muted)]" />
          <span className="flex-1">
            <span className="block font-medium text-[var(--color-ink)]">Download my data</span>
            <span className="block text-sm text-[var(--color-ink-muted)]">
              We&rsquo;ll email you a link, good for 24 hours.
            </span>
          </span>
        </button>
        <Link
          href="/profile/privacy/delete"
          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4 transition-colors hover:border-[var(--color-crisis)]"
        >
          <Trash size={20} className="text-[var(--color-crisis)]" />
          <span className="flex-1">
            <span className="block font-medium text-[var(--color-crisis)]">Delete my account</span>
            <span className="block text-sm text-[var(--color-ink-muted)]">
              Permanent. We&rsquo;ll explain exactly what happens first.
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
