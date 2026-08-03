import Link from "next/link";
import { ArrowLeft, LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";
import { PayButton } from "@/components/app/pay-button";

/*
  Checkout (D58). Razorpay is the gateway — its own modal handles UPI / card /
  netbanking selection, so we deliberately do NOT render payment-method radios
  here. This page is the order summary + promo + a single Pay button that will
  open Razorpay once keys are wired.
*/
export default async function CheckoutPage() {
  const config = await getConfig();

  return (
    <div className="mx-auto max-w-[640px]">
      <Link
        href="/trial/ended"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <p className="eyebrow">Checkout</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        Payment
      </h1>

      {/* Order summary */}
      <Card className="mt-6 flex items-center justify-between p-6">
        <div>
          <p className="font-semibold text-[var(--color-ink)]">
            Break It Through · {config.programDays} days
          </p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            One payment · all {config.programDays} days · no renewal
          </p>
        </div>
        <p className="font-display text-2xl text-[var(--color-ink)]">₹{config.programPriceInr}</p>
      </Card>

      {/* Promo */}
      <details className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink)]">
          Have a promo code?
        </summary>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="Enter code"
            className="h-11 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] px-3 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <Button variant="outline" size="sm">
            Apply
          </Button>
        </div>
      </details>

      <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-subtle)] p-4 text-sm text-[var(--color-brand-subtle-ink)]">
        <ShieldCheck size={18} weight="fill" />
        You&rsquo;ll pay securely with Razorpay — UPI, card or netbanking, your choice.
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
          <LockKey size={14} /> Secured &amp; encrypted · no auto-renewal
        </p>
        <PayButton amountInr={config.programPriceInr} />
      </div>
    </div>
  );
}
