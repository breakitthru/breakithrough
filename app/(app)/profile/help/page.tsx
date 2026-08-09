import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, Lifebuoy, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";

const faqs = [
  { q: "What happens if I miss a day?", a: "Nothing bad. Days never lock you out — you pick up at the next incomplete day, and your streak pauses instead of breaking." },
  { q: "Is my journal really private?", a: "Yes. Reflections and chats are encrypted and never shown to any admin or specialist without your explicit, per-time consent." },
  { q: "Is this a subscription?", a: "No. It's a single one-time payment for all 60 days, with no auto-renewal." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Profile
      </Link>

      <p className="eyebrow">Help &amp; support</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        We&rsquo;ve got you.
      </h1>

      <div className="mt-6 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
          >
            <summary className="flex cursor-pointer items-center justify-between font-medium text-[var(--color-ink)]">
              {f.q}
              <CaretDown size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[var(--color-ink-muted)]">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="eyebrow mt-8">Still stuck?</p>
      <Card className="mt-3 flex flex-col gap-3 p-6 sm:flex-row">
        <a
          href="mailto:breakitthru@gmail.com"
          className="flex flex-1 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-4 py-3 transition-colors hover:bg-[var(--color-brand-subtle)]"
        >
          <EnvelopeSimple size={20} className="text-[var(--color-ink-muted)]" />
          <span className="text-sm font-medium text-[var(--color-ink)]">Email support</span>
        </a>
        <Link
          href="/sos"
          className="flex flex-1 items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-crisis-subtle)] px-4 py-3 transition-colors hover:opacity-90"
        >
          <Lifebuoy size={20} className="text-[var(--color-crisis)]" />
          <span className="text-sm font-medium text-[var(--color-crisis)]">In a crisis? SOS</span>
        </Link>
      </Card>
    </div>
  );
}
