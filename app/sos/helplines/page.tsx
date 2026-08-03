import Link from "next/link";
import { ArrowLeft, Phone } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { getHelplines } from "@/lib/program";

export default async function HelplinesPage() {
  const helplines = await getHelplines();
  return (
    <div>
      <Link
        href="/sos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> SOS
      </Link>
      <p className="eyebrow">Helplines</p>
      <h1 className="font-display mt-1 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        You&rsquo;re not alone in this.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">Free, confidential, 24×7 unless noted.</p>

      <div className="mt-6 flex flex-col gap-3">
        {helplines.map((h) => (
          <Card key={h.name} className="flex items-center gap-4 p-5">
            <div className="flex-1">
              <p className="font-medium text-[var(--color-ink)]">{h.name}</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {h.hours} · {h.languages}
              </p>
            </div>
            <a
              href={`tel:${h.phone.replace(/[^0-9]/g, "")}`}
              className="flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]"
            >
              <Phone size={16} weight="fill" /> {h.phone}
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
