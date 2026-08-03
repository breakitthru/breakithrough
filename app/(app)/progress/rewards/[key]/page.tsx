import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { rewards } from "@/lib/content";
import { requireOnboardedUser } from "@/lib/session";

// Redemption confirmation. NOTE: recording the redemption + deducting points is
// a follow-up (needs the ₹-per-point decision + fulfilment flow). Display only.
export default async function RedeemPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const reward = rewards.find((r) => r.key === key);
  if (!reward) notFound();
  const user = await requireOnboardedUser();

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[520px] flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success-subtle)] text-[var(--color-success)]">
        <CheckCircle size={40} weight="fill" />
      </span>
      <p className="eyebrow mt-6">Redeemed</p>
      <h1 className="font-display mt-2 text-[2.5rem] leading-tight text-[var(--color-ink)]">
        {reward.title} is yours.
      </h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        {reward.pointsCost} points · {Math.max(0, user.pointsBalance - reward.pointsCost)} left. We&rsquo;ll
        send it to your email, or post it if it&rsquo;s a physical reward.
      </p>
      <Link href="/progress/rewards" className="mt-8">
        <Button variant="primary">Back to shop</Button>
      </Link>
    </div>
  );
}
