import Link from "next/link";
import { ArrowLeft, LockKey, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { getConfig } from "@/lib/config";
import { CheckoutPanel } from "@/components/app/checkout-panel";

/*
  Checkout (D58). Razorpay is the gateway — its own modal handles UPI / card /
  netbanking. The order summary lives here; the promo code + pay button are the
  interactive CheckoutPanel (promo is re-priced server-side).
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
            Break It Thru · {config.programDays} days
          </p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            One payment · all {config.programDays} days · no renewal
          </p>
        </div>
        <p className="font-display text-2xl text-[var(--color-ink)]">₹{config.programPriceInr}</p>
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-subtle)] p-4 text-sm text-[var(--color-brand-subtle-ink)]">
        <ShieldCheck size={18} weight="fill" />
        You&rsquo;ll pay securely with Razorpay — UPI, card or netbanking, your choice.
      </div>

      <CheckoutPanel amountInr={config.programPriceInr} />

      <p className="mt-4 flex items-center gap-1.5 text-sm text-[var(--color-ink-faint)]">
        <LockKey size={14} /> Secured &amp; encrypted · no auto-renewal
      </p>
    </div>
  );
}
