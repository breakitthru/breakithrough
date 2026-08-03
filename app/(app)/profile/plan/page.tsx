import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { getConfig } from "@/lib/config";
import { demoUser } from "@/lib/mock";

// Your program / manage plan (D64) with receipt + billing history (D65).
export default async function PlanPage() {
  const config = await getConfig();
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Profile
      </Link>

      <p className="eyebrow">Your program</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        You&rsquo;re all paid up.
      </h1>

      <Card className="mt-6 p-6">
        <div className="flex items-center gap-3">
          <CheckCircle size={22} weight="fill" className="text-[var(--color-success)]" />
          <div>
            <p className="font-semibold text-[var(--color-ink)]">
              Break It Through · {config.programDays} days
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Paid · Day {demoUser.currentDay} of {config.programDays} · no renewal
            </p>
          </div>
        </div>
      </Card>

      <p className="eyebrow mt-8">Billing history</p>
      <Card className="mt-3 divide-y divide-[var(--color-line)] p-0">
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
            <Receipt size={18} />
          </span>
          <div className="flex-1">
            <p className="font-medium text-[var(--color-ink)]">
              {config.programDays}-day program
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">Paid · 17 Jul 2026</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-[var(--color-ink)]">₹{config.programPriceInr}</p>
            <button className="text-xs text-[var(--color-accent)] hover:underline">
              Download receipt
            </button>
          </div>
        </div>
      </Card>

      <p className="mt-6 text-sm text-[var(--color-ink-faint)]">
        Questions about a charge? Reach us from Help &amp; support — refunds follow our policy.
      </p>
    </div>
  );
}
