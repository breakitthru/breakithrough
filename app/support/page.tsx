import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Envelope, Lifebuoy, Question } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { SUPPORT_EMAIL } from "@/lib/legal-content";

export const metadata: Metadata = { title: "Support · Break It Thru" };

async function supportEmail() {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: "supportEmail" } });
    const val = typeof row?.value === "string" ? row.value : null;
    return val && val.trim() ? val : SUPPORT_EMAIL;
  } catch {
    return SUPPORT_EMAIL;
  }
}

const FAQ = [
  {
    q: "How does the free trial work?",
    a: "The first four days of the programme are free and don't need a card. After that, a single one-time payment unlocks the full 60 days.",
  },
  {
    q: "Is this therapy?",
    a: "No. Break It Thru is a clinician-authored self-help programme, not therapy or medical care. If you need professional support, please reach out to a qualified professional.",
  },
  {
    q: "Are my reflections private?",
    a: "Yes. Your reflections are treated as private and are never sold or used for advertising. See our Privacy Policy for details.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Profile → Privacy → Delete account. This anonymises or erases your personal data and reflections.",
  },
  {
    q: "Can I get a refund?",
    a: "You can request a refund within 7 days of purchase, subject to our Refund Policy. Email us and we'll help.",
  },
];

export default async function SupportPage() {
  const email = await supportEmail();

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <div className="mx-auto max-w-[760px] px-6 py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} /> Home
        </Link>

        <p className="eyebrow">Support</p>
        <h1 className="font-display mt-1 text-[2.4rem] leading-tight text-[var(--color-ink)]">
          We&rsquo;re here to help.
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--color-ink-muted)]">
          Questions about your account, a payment, or the programme? Reach out and a real person will get back to you.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <Envelope size={24} className="text-[var(--color-brand)]" />
            <h2 className="font-display mt-3 text-[1.1rem] text-[var(--color-ink)]">Email us</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">We aim to reply within 3 business days.</p>
            <a
              href={`mailto:${email}`}
              className="mt-3 inline-block text-sm font-medium text-[var(--color-brand)] underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <Lifebuoy size={24} weight="fill" className="text-[var(--color-accent)]" />
            <h2 className="font-display mt-3 text-[1.1rem] text-[var(--color-ink)]">In a crisis?</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Support email isn&rsquo;t for emergencies. Open SOS for grounding tools and helplines.
            </p>
            <Link
              href="/sos"
              className="mt-3 inline-block text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Open SOS
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Question size={22} className="text-[var(--color-ink-muted)]" />
            <h2 className="font-display text-[1.4rem] text-[var(--color-ink)]">Common questions</h2>
          </div>
          <div className="mt-5 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-[0.98rem] font-medium text-[var(--color-ink)]">{f.q}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--color-ink-muted)]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--color-line)] pt-6 text-sm">
          <Link href="/legal/terms" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Terms of Use</Link>
          <Link href="/legal/privacy" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Privacy Policy</Link>
          <Link href="/legal/refund" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Refund Policy</Link>
        </div>
      </div>
    </div>
  );
}
