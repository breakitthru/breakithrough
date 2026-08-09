import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Card, Chip } from "@/components/ui/card";
import { OrderActions } from "@/components/admin/shop/order-actions";

const TONE: Record<string, "success" | "caution" | "neutral" | "crisis" | "brand"> = {
  PAID: "caution",
  FULFILLED: "success",
  CANCELLED: "neutral",
  FAILED: "crisis",
  PENDING: "neutral",
};

function timeAgo(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function AdminOrdersPage() {
  await requirePermission("shop.manage");
  // Paid orders that still need fulfilment surface first. Orders are permanent.
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "FULFILLED", "CANCELLED"] } },
    include: { items: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <>
      <PageHeader eyebrow="Shop" title="Orders" subtitle="Every paid order, kept permanently. Paid orders await fulfilment." />
      {orders.length === 0 ? (
        <EmptyState title="No orders yet." body="Paid shop orders will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--color-ink)]">{o.shipName}</p>
                    <Chip tone={TONE[o.status] ?? "neutral"} className="uppercase tracking-wide">{o.status.toLowerCase()}</Chip>
                    <span className="text-xs text-[var(--color-ink-faint)]">{timeAgo(o.createdAt)}</span>
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
                      <li key={i.id}>{i.title} × {i.quantity} · ₹{i.priceInr}</li>
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

              {o.status === "PAID" && (
                <div className="mt-4 flex justify-end">
                  <OrderActions id={o.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
