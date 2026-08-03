import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";

// Payment failed (D59) — retry, no shame, progress is safe.
export default function PaymentFailedPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[520px] flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-caution-subtle)] text-[var(--color-caution)]">
        <WarningCircle size={40} weight="fill" />
      </span>
      <p className="eyebrow mt-6">Payment didn&rsquo;t go through</p>
      <h1 className="font-display mt-2 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        No harm done.
      </h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        Nothing was charged and everything you&rsquo;ve done is saved. It happens — want to try again?
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/checkout/payment">
          <Button variant="primary" size="lg">
            Try again
          </Button>
        </Link>
        <Link href="/today">
          <Button variant="ghost" size="lg">
            Not now
          </Button>
        </Link>
      </div>
    </div>
  );
}
