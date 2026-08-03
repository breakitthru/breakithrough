import Link from "next/link";
import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { Button } from "@/components/ui/button";

// Trusted contact (D12) — one name + number, used as a tel: button inside SOS.
// Optional but strongly encouraged. (No persistence yet.)
export default function TrustedContactPage() {
  return (
    <SplitCanvas
      backHref="/welcome/consent"
      leftTitle={
        <>
          One person,
          <br />
          one tap away.
        </>
      }
      leftBody="If a hard moment comes, we'll put them one button away inside SOS — no searching, no thinking."
      quote={{
        text: "The people who get through the worst nights usually reached for someone. This makes that easy.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <div>
        <h1 className="font-display text-[2.5rem] leading-tight text-[var(--color-ink)]">
          Someone you trust
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          We&rsquo;ll only ever show this to you, as a call button. Never messaged, never shared.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="eyebrow">Their name</label>
            <input
              placeholder="e.g. Maya"
              className="mt-2 h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="eyebrow">Their number</label>
            <input
              placeholder="+91 …"
              className="mt-2 h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/welcome/why"
            className="text-sm text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
          >
            Skip for now
          </Link>
          <Link href="/welcome/why">
            <Button variant="primary">Continue</Button>
          </Link>
        </div>
      </div>
    </SplitCanvas>
  );
}
