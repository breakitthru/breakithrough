import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { LEGAL_DOCS } from "@/lib/legal-content";

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  return { title: doc ? `${doc.title} · Break It Thru` : "Break It Thru" };
}

async function adminOverride(key: string) {
  try {
    const row = await prisma.policy.findUnique({ where: { key } });
    if (row?.body?.trim() && row.liveSince) return row;
  } catch {
    /* fall back to default copy */
  }
  return null;
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) notFound();

  const override = await adminOverride(doc.key);

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <div className="mx-auto max-w-[760px] px-6 py-14">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={16} /> Home
        </Link>

        <p className="eyebrow">Legal</p>
        <h1 className="font-display mt-1 text-[2.4rem] leading-tight text-[var(--color-ink)]">
          {override?.title ?? doc.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-faint)]">Last updated: {doc.updated}</p>

        {override ? (
          <div className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-[var(--color-ink-muted)]">
            {override.body.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </div>
        ) : (
          <>
            <p className="mt-8 text-[0.95rem] leading-relaxed text-[var(--color-ink-muted)]">{doc.intro}</p>
            <div className="mt-8 space-y-8">
              {doc.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className="font-display text-[1.2rem] text-[var(--color-ink)]">{s.heading}</h2>
                  <div className="mt-2 space-y-3 text-[0.95rem] leading-relaxed text-[var(--color-ink-muted)]">
                    {s.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--color-line)] pt-6 text-sm">
          <Link href="/legal/terms" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Terms of Use</Link>
          <Link href="/legal/privacy" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Privacy Policy</Link>
          <Link href="/legal/refund" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Refund Policy</Link>
          <Link href="/support" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">Support</Link>
        </div>
      </div>
    </div>
  );
}
