import Link from "next/link";
import {
  CreditCard,
  Bell,
  ShieldCheck,
  VideoCamera,
  Path,
  Question,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { requireOnboardedUser } from "@/lib/session";
import { currentDay } from "@/lib/program";
import { phaseForDay, getConfig } from "@/lib/config";
import { SignOutRow } from "@/components/app/sign-out";

function Row({
  icon,
  title,
  sub,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-sunken)]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]">
        {icon}
      </span>
      <div className="flex-1">
        <p className="font-medium text-[var(--color-ink)]">{title}</p>
        {sub && <p className="text-sm text-[var(--color-ink-muted)]">{sub}</p>}
      </div>
      <CaretRight size={18} className="text-[var(--color-ink-faint)]" />
    </Link>
  );
}

const PLAN_LABEL: Record<string, string> = {
  TRIAL: "Free trial",
  ACTIVE: "Paid",
  EXPIRED: "Trial ended",
  COMPLETED: "Completed",
};

export default async function ProfilePage() {
  const user = await requireOnboardedUser();
  const config = await getConfig();
  const today = currentDay(user);
  const phase = phaseForDay(today);
  const name = user.displayName ?? user.name ?? "You";

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow">Your profile</p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            {name}
          </h1>
          <p className="mt-1 text-[var(--color-ink-muted)]">
            Day {today} of {config.programDays} · {phase.name}
          </p>
        </div>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-semibold text-[var(--color-accent-fg)]">
          {name.charAt(0).toUpperCase()}
        </span>
      </header>

      <p className="eyebrow mb-3">Account</p>
      <Card className="mb-8 divide-y divide-[var(--color-line)] p-0">
        <Row icon={<CreditCard size={18} />} title="Your program" sub={`${PLAN_LABEL[user.plan]} · Day ${today} of ${config.programDays}`} href="/profile/plan" />
        <Row icon={<Bell size={18} />} title="Notifications" sub="Sessions & gentle reminders" href="/profile/notifications" />
        <Row icon={<ShieldCheck size={18} />} title="Privacy center" sub="DPDP · you control your data" href="/profile/privacy" />
      </Card>

      <p className="eyebrow mb-3">Your journey</p>
      <Card className="mb-8 divide-y divide-[var(--color-line)] p-0">
        <Row icon={<VideoCamera size={18} />} title="1:1 Sessions" sub="Book or manage your sessions" href="/sessions" />
        <Row icon={<Path size={18} />} title="Journey history" sub={`Day ${today} of ${config.programDays} · Phase ${phase.order} of 4`} href="/journey" />
      </Card>

      <p className="eyebrow mb-3">Support</p>
      <Card className="divide-y divide-[var(--color-line)] p-0">
        <Row icon={<Question size={18} />} title="Help & support" sub="FAQs, contact & safety info" href="/profile/help" />
        <SignOutRow />
      </Card>
    </div>
  );
}
