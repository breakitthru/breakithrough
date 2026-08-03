import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";

// Payment confirmed (D63).
export default async function ConfirmedPage() {
  const config = await getConfig();
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[520px] flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-subtle)] text-[var(--color-success)]">
        <CheckCircle size={40} weight="fill" />
      </span>
      <p className="eyebrow mt-6">Payment confirmed</p>
      <h1 className="font-display mt-2 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        All {config.programDays} days are yours.
      </h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        No renewal, no surprises. A receipt is on its way to your email. Now — back to it, gently.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/today">
          <Button variant="primary" size="lg">
            Back to Today
          </Button>
        </Link>
        <Link href="/profile/plan">
          <Button variant="outline" size="lg">
            View receipt
          </Button>
        </Link>
      </div>
    </div>
  );
}
