import Link from "next/link";
import { SplitCanvas } from "@/components/onboarding/split-canvas";
import { Button } from "@/components/ui/button";

// "Why I started" (D13) — free text, read back to the user inside the SOS flow.
// One of the most important fields in the product.
export default function WhyPage() {
  return (
    <SplitCanvas
      backHref="/welcome/trusted-contact"
      leftTitle={
        <>
          Why did you
          <br />
          start?
        </>
      }
      leftBody="On a hard night, we'll show these words back to you — in your own voice, from today."
      quote={{
        text: "The version of you writing this is the one worth listening to at 2am.",
        author: "Dr. Ananya Rao · Clinical Psychologist",
      }}
    >
      <div>
        <h1 className="font-display text-[2.5rem] leading-tight text-[var(--color-ink)]">
          In your own words
        </h1>
        <p className="mt-2 text-[var(--color-ink-muted)]">
          A sentence or two. There&rsquo;s no right way to say it.
        </p>

        <textarea
          autoFocus
          rows={6}
          placeholder="I started because…"
          className="mt-6 w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-5 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
        />

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/welcome/start"
            className="text-sm text-[var(--color-ink-muted)] underline-offset-4 hover:underline"
          >
            Skip for now
          </Link>
          <Link href="/welcome/start">
            <Button variant="primary">Continue</Button>
          </Link>
        </div>
      </div>
    </SplitCanvas>
  );
}
