import Link from "next/link";
import { ArrowLeft, ArrowSquareOut, CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ORDER_STEPS,
  stepIndex,
  statusLabel,
  statusTone,
  type OrderStatus,
} from "@/lib/order-status";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Horizontal Paid -> Shipped -> Delivered stepper. */
function Stepper({ status }: { status: OrderStatus }) {
  const active = stepIndex(status);
  return (
    <div className="mt-5 flex items-center">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= active;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  done
                    ? "bg-[var(--color-brand)] text-[var(--color-brand-fg)]"
                    : "bg-[var(--color-line-strong)] text-[var(--color-ink-faint)]"
                }`}
              >
                {done ? <CheckCircle size={18} weight="fill" /> : i + 1}
              </span>
              <span className={`mt-1.5 text-xs ${done ? "text-[var(--color-ink)]" : "text-[var(--color-ink-faint)]"}`}>
                {step.label}
              </span>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 ${i < active ? "bg-[var(--color-brand)]" : "bg-[var(--color-line-strong)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function ShopOrdersPage() {
  const user = await requireOnboardedUser();

  // Only orders that actually went through (paid or beyond). Abandoned PENDING /
  // FAILED checkouts are hidden — they never became real orders for the member.
  const orders = await prisma.order.findMany({
    where: { userId: user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED", "FULFILLED", "CANCELLED"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[820px]">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft size={16} /> The shop
      </Link>

      <h1 className="font-display text-[2.75rem] leading-tight text-[var(--color-ink)]">Your orders.</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">Track everything you&rsquo;ve bought and where it is.</p>

      {orders.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">You haven&rsquo;t ordered anything yet.</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="primary" size="sm">Browse the shop</Button>
          </Link>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {orders.map((o) => {
            const status = o.status as OrderStatus;
            const cancelled = status === "CANCELLED";
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--color-ink)]">Order #{o.id.slice(-6).toUpperCase()}</p>
                      <Chip tone={statusTone(status)} className="uppercase tracking-wide">{statusLabel(status)}</Chip>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">Placed {fmtDate(o.createdAt)}</p>
                  </div>
                  <p className="font-display text-xl text-[var(--color-ink)]">₹{o.totalInr}</p>
                </div>

                {/* Items */}
                <ul className="mt-4 space-y-1 text-sm text-[var(--color-ink-muted)]">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.title}
                      {i.size ? ` · ${i.size}` : ""} × {i.quantity}
                    </li>
                  ))}
                </ul>

                {cancelled ? (
                  <div className="mt-5 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
                    <XCircle size={18} /> This order was cancelled. If you were charged, a refund follows.
                  </div>
                ) : (
                  <>
                    <Stepper status={status} />

                    {/* ETA + tracking */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
                      <div className="text-sm">
                        {status === "DELIVERED" || status === "FULFILLED" ? (
                          <span className="text-[var(--color-success)]">Delivered</span>
                        ) : o.etaAt ? (
                          <span className="text-[var(--color-ink)]">
                            <span className="text-[var(--color-ink-muted)]">Estimated delivery · </span>
                            {fmtDate(o.etaAt)}
                          </span>
                        ) : (
                          <span className="text-[var(--color-ink-muted)]">
                            {status === "PAID" ? "Being packed — a delivery date appears once it ships." : "On the way."}
                          </span>
                        )}
                        {o.trackingCarrier && (
                          <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">
                            {o.trackingCarrier}
                            {o.trackingNumber ? ` · ${o.trackingNumber}` : ""}
                          </p>
                        )}
                      </div>
                      {o.trackingUrl && (
                        <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">
                            Track <ArrowSquareOut size={15} />
                          </Button>
                        </a>
                      )}
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
