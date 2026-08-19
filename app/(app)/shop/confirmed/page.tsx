import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { requireOnboardedUser } from "@/lib/session";

export default async function ShopConfirmedPage() {
  await requireOnboardedUser();
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[520px] flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-subtle)] text-[var(--color-success)]">
        <CheckCircle size={40} weight="fill" />
      </span>
      <p className="eyebrow mt-6">Order placed</p>
      <h1 className="font-display mt-2 text-[2.75rem] leading-tight text-[var(--color-ink)]">Thank you.</h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        Your order is confirmed and on its way to being packed. We&rsquo;ve emailed your confirmation, and
        you can follow its progress any time under your orders.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop/orders"><Button variant="primary" size="lg">Track your order</Button></Link>
        <Link href="/shop"><Button variant="outline" size="lg">Back to shop</Button></Link>
      </div>
    </div>
  );
}
