import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getConfig } from "@/lib/config";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay } from "@/lib/program";

export default async function PlanPage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const today = currentDay(user);
  const isPaid = user.plan === "ACTIVE" || user.plan === "COMPLETED";

  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Profile
      </Link>

      <p className="eyebrow">Your program</p>

      {isPaid ? (
        <>
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
                  Paid · Day {today} of {config.programDays} · no renewal
                </p>
              </div>
            </div>
          </Card>

          <p className="eyebrow mt-8">Billing history</p>
          <Card className="mt-3 flex items-center gap-4 p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
              <Receipt size={18} />
            </span>
            <div className="flex-1">
              <p className="font-medium text-[var(--color-ink)]">{config.programDays}-day program</p>
              <p className="text-sm text-[var(--color-ink-muted)]">
                {user.paidAt?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) ?? "Paid"}
              </p>
            </div>
            <p className="font-medium text-[var(--color-ink)]">₹{config.programPriceInr}</p>
          </Card>
        </>
      ) : (
        <>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            You&rsquo;re on the free trial.
          </h1>
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-3">
              <Sparkle size={22} weight="fill" className="text-[var(--color-accent)]" />
              <div>
                <p className="font-semibold text-[var(--color-ink)]">
                  Trial · Day {today} of {config.trialDays} free days
                </p>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Unlock all {config.programDays} days for a one-time ₹{config.programPriceInr}.
                </p>
              </div>
            </div>
            <Link href="/trial/ended" className="mt-4 block">
              <Button variant="primary" className="w-full">
                Continue my {config.programDays} days · ₹{config.programPriceInr}
              </Button>
            </Link>
          </Card>
        </>
      )}
    </div>
  );
}
