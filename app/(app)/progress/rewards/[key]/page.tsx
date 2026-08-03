import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

// Confirmation for a real redemption. If the user hasn't actually redeemed this
// reward, send them back to the shop (no fake confirmations).
export default async function RedeemPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const user = await requireOnboardedUser();

  const reward = await prisma.reward.findUnique({ where: { key } });
  if (!reward) notFound();

  const redemption = await prisma.redemption.findFirst({
    where: { userId: user.id, rewardId: reward.id },
    orderBy: { createdAt: "desc" },
  });
  if (!redemption) redirect("/progress/rewards");

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
        {redemption.pointsSpent} points spent · {user.pointsBalance} left. We&rsquo;ll send it to your
        email, or post it if it&rsquo;s a physical reward.
      </p>
      <Link href="/progress/rewards" className="mt-8">
        <Button variant="primary">Back to shop</Button>
      </Link>
    </div>
  );
}
