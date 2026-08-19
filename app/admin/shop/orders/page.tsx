import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";
import { OrderActions } from "@/components/admin/shop/order-actions";
import { statusLabel, statusTone, type OrderStatus } from "@/lib/order-status";

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Date -> yyyy-mm-dd for a <input type="date">. */
function toDateInput(d: Date | null): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

export default async function AdminOrdersPage() {
  await requirePermission("shop.manage");
  // Real orders (paid or beyond). PENDING/FAILED never completed. Orders are permanent.
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "SHIPPED", "DELIVERED", "FULFILLED", "CANCELLED"] } },
    include: { items: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const needsAction = orders.filter((o) => o.status === "PAID" || o.status === "SHIPPED").length;

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Orders"
        subtitle={
          needsAction > 0
            ? `${needsAction} order${needsAction === 1 ? "" : "s"} to pack or ship. Set status, delivery date, and tracking.`
            : "Every paid order, kept permanently. Set status, delivery date, and tracking."
        }
      />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet." body="Paid shop orders will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const status = o.status as OrderStatus;
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[var(--color-ink)]">{o.shipName}</p>
                      <Chip tone={statusTone(status)} className="uppercase tracking-wide">{statusLabel(status)}</Chip>
                      <span className="text-xs text-[var(--color-ink-faint)]">#{o.id.slice(-6).toUpperCase()} · {timeAgo(o.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[var(--color-ink-muted)]">{o.user?.email ?? "no email"} · {o.shipPhone}</p>
                  </div>
                  <p className="font-display text-xl text-[var(--color-ink)]">₹{o.totalInr}</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-1">Items</p>
                    <ul className="text-sm text-[var(--color-ink-muted)]">
                      {o.items.map((i) => (
                        <li key={i.id}>{i.title}{i.size ? ` (${i.size})` : ""} × {i.quantity} · ₹{i.priceInr}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Ship to</p>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      {o.shipLine1}{o.shipLine2 ? `, ${o.shipLine2}` : ""}<br />
                      {o.shipCity}, {o.shipState} {o.shipPincode}
                    </p>
                  </div>
                </div>

                <OrderActions
                  id={o.id}
                  status={o.status}
                  etaAt={toDateInput(o.etaAt)}
                  trackingCarrier={o.trackingCarrier}
                  trackingNumber={o.trackingNumber}
                  trackingUrl={o.trackingUrl}
                />
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
