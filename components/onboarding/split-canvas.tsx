import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getConfig } from "@/lib/config";
import { BrandLogo } from "@/components/brand-logo";

/*
  Shared split-canvas used across auth + onboarding (login, intake, consent,
  trusted contact, etc.): a dark evergreen brand panel on the left and a work
  area on the right. Matches D02–D14.
*/
export async function SplitCanvas({
  leftTitle,
  leftBody,
  bullets,
  quote,
  backHref,
  children,
}: {
  leftTitle: React.ReactNode;
  leftBody?: string;
  bullets?: string[];
  quote?: { text: string; author: string };
  backHref?: string;
  children: React.ReactNode;
}) {
  const config = await getConfig();
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-brand-ink)] p-14 text-[var(--color-brand-fg)] lg:flex">
        <BrandLogo
          logoUrl={config.logoUrl}
          logoSize={config.logoSize}
          alt="Break It Thru"
          fallback={
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-on-dark.svg" alt="Break It Thru" className="h-20 w-auto" />
            </>
          }
        />
        <div className="relative z-10">
          <h1 className="font-display text-[2.75rem] leading-[1.08]">{leftTitle}</h1>
          {leftBody && <p className="mt-5 max-w-sm text-white/70">{leftBody}</p>}
          {bullets && (
            <ul className="mt-6 space-y-2 text-white/70">
              {bullets.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          )}
        </div>
        {quote ? (
          <blockquote className="relative z-10 max-w-sm border-t border-white/15 pt-5 text-white/60">
            <p className="font-display italic">&ldquo;{quote.text}&rdquo;</p>
            <footer className="mt-2 text-sm">{quote.author}</footer>
          </blockquote>
        ) : (
          <div />
        )}
        {/* subtle clay arc */}
        <svg
          className="pointer-events-none absolute bottom-24 left-0 h-64 w-[140%]"
          viewBox="0 0 600 300"
          fill="none"
        >
          <path d="M0 300 A 400 400 0 0 1 560 40" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.5" />
          <circle cx="500" cy="70" r="6" fill="var(--color-accent)" />
        </svg>
      </div>

      {/* Right work area */}
      <div className="relative flex flex-col px-8 py-10 sm:px-16 lg:px-20">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        )}
        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto w-full max-w-[520px]">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** 4-step progress bar used in the intake questionnaire. */
export function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div>
      <p className="eyebrow">
        Step {step} of {total}
      </p>
      <div className="mt-2 flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < step ? "bg-[var(--color-accent)]" : "bg-[var(--color-line-strong)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
