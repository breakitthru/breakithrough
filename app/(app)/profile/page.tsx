import Link from "next/link";
import {
  CreditCard,
  Bell,
  ShieldCheck,
  VideoCamera,
  Path,
  Question,
  SignOut,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { demoUser, getDay } from "@/lib/mock";
import { getConfig } from "@/lib/config";

function Row({
  icon,
  title,
  sub,
  href,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--color-surface-sunken)]"
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          danger
            ? "bg-[var(--color-crisis-subtle)] text-[var(--color-crisis)]"
            : "bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <p className={`font-medium ${danger ? "text-[var(--color-crisis)]" : "text-[var(--color-ink)]"}`}>
          {title}
        </p>
        {sub && <p className="text-sm text-[var(--color-ink-muted)]">{sub}</p>}
      </div>
      {!danger && <CaretRight size={18} className="text-[var(--color-ink-faint)]" />}
    </Link>
  );
}

export default async function ProfilePage() {
  const config = await getConfig();
  const phase = getDay(demoUser.currentDay);

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <p className="eyebrow">Your profile</p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
            {demoUser.displayName}
          </h1>
          <p className="mt-1 text-[var(--color-ink-muted)]">
            Day {demoUser.currentDay} of {config.programDays} · {phase.phaseName}
          </p>
        </div>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl font-semibold text-[var(--color-accent-fg)]">
          {demoUser.avatarInitial}
        </span>
      </header>

      <p className="eyebrow mb-3">Account</p>
      <Card className="mb-8 divide-y divide-[var(--color-line)] p-0">
        <Row icon={<CreditCard size={18} />} title="Your program" sub={`Paid · Day ${demoUser.currentDay} of ${config.programDays}`} href="/profile/plan" />
        <Row icon={<Bell size={18} />} title="Notifications" sub="Sessions & gentle reminders · On" href="/profile/notifications" />
        <Row icon={<ShieldCheck size={18} />} title="Privacy center" sub="DPDP · you control your data" href="/profile/privacy" />
      </Card>

      <p className="eyebrow mb-3">Your journey</p>
      <Card className="mb-8 divide-y divide-[var(--color-line)] p-0">
        <Row icon={<VideoCamera size={18} />} title="1:1 Sessions" sub="Book or manage your sessions" href="/sessions" />
        <Row icon={<Path size={18} />} title="Journey history" sub={`Day ${demoUser.currentDay} of ${config.programDays} · Phase ${phase.phaseOrder} of 4`} href="/journey" />
      </Card>

      <p className="eyebrow mb-3">Support</p>
      <Card className="divide-y divide-[var(--color-line)] p-0">
        <Row icon={<Question size={18} />} title="Help & support" sub="FAQs, contact & safety info" href="/profile/help" />
        <Row icon={<SignOut size={18} />} title="Sign out" href="/api/auth/signout" danger />
      </Card>
    </div>
  );
}
