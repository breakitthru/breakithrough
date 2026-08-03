import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  PenNib,
  CreditCard,
  UsersThree,
  Lock,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { demoUser, rewards } from "@/lib/mock";

const ICONS: Record<string, React.ComponentType<{ size?: number; weight?: "fill" }>> = {
  "sleep-stories": Gift,
  "recovery-journal": PenNib,
  "merch-discount": CreditCard,
  "session-discount": UsersThree,
  "care-package": Gift,
};

export default function RewardsPage() {
  const featured = rewards.find((r) => r.featured);
  const rest = rewards.filter((r) => !r.featured);

  return (
    <div className="mx-auto max-w-[880px]">
      <Link
        href="/progress"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <p className="eyebrow text-[var(--color-accent)]">{demoUser.pointsBalance} points to spend</p>
      <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">
        A little something back.
      </h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">
        One point for every task you finish. Redeem them for merch in our online shop.
      </p>

      {/* Featured */}
      {featured && (
        <Card className="mt-7 flex items-center gap-5 p-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-ink)] text-white">
            <Gift size={28} weight="fill" />
          </span>
          <div className="flex-1">
            <p className="eyebrow text-[var(--color-accent)]">Featured · {featured.pointsCost} points</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{featured.title}</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">{featured.description}</p>
          </div>
          <Link href={`/progress/rewards/${featured.key}`}>
            <button className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)]">
              Redeem · {featured.pointsCost} points
            </button>
          </Link>
        </Card>
      )}

      <p className="eyebrow mt-8">More in the shop</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rest.map((r) => {
          const Icon = ICONS[r.key] ?? Gift;
          const affordable = demoUser.pointsBalance >= r.pointsCost;
          const redeemed = r.status === "redeemed";
          const locked = !redeemed && !affordable;
          return (
            <Card
              key={r.id}
              className={`p-5 ${locked ? "opacity-60" : ""}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                <Icon size={22} />
              </span>
              <h3 className="mt-3 font-semibold text-[var(--color-ink)]">{r.title}</h3>
              <p className="text-sm text-[var(--color-ink-muted)]">{r.description}</p>
              <div className="mt-3 text-sm">
                {redeemed ? (
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-success)]">
                    <CheckCircle size={16} weight="fill" /> Redeemed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                    <Lock size={14} /> {r.pointsCost} points
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-[var(--color-ink-faint)]">
        Redeemed rewards are posted from our shop, or sent to your email.
      </p>
    </div>
  );
}
