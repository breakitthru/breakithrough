import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";
import { getConfig } from "@/lib/config";
import { PrintButton } from "@/components/app/shop/print-button";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireOnboardedUser();
  const { id } = await params;

  // Only the order's owner can view its invoice, and only once paid.
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED", "FULFILLED"] } },
    include: { items: true, user: { select: { email: true } } },
  });
  if (!order) notFound();

  const config = await getConfig();
  const shortId = order.id.slice(-6).toUpperCase();
  const subtotal = order.totalInr - order.shippingInr;

  // GST is inclusive: back it out of the grand total when a rate + GSTIN are set.
  const gstOn = config.gstRatePct > 0 && Boolean(config.gstin);
  const rate = config.gstRatePct;
  const taxTotal = gstOn ? Math.round((order.totalInr * rate) / (100 + rate)) : 0;
  const taxableValue = order.totalInr - taxTotal;
  const cgst = Math.round((taxTotal / 2) * 100) / 100;
  const sgst = taxTotal - cgst;

  const row = "flex justify-between py-1 text-sm";

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/shop/orders" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
          <ArrowLeft size={16} /> Your orders
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-line)] pb-5">
          <div>
            <h1 className="font-display text-2xl text-[var(--color-ink)]">{gstOn ? "Tax Invoice" : "Receipt"}</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Order #{shortId}</p>
            <p className="text-sm text-[var(--color-ink-muted)]">{fmtDate(order.createdAt)}</p>
          </div>
          <div className="text-right text-sm text-[var(--color-ink-muted)]">
            <p className="font-semibold text-[var(--color-ink)]">{config.businessName}</p>
            {config.businessAddress && <p className="whitespace-pre-line">{config.businessAddress}</p>}
            {gstOn && <p>GSTIN: {config.gstin}</p>}
          </div>
        </div>

        {/* Bill to */}
        <div className="border-b border-[var(--color-line)] py-5">
          <p className="eyebrow mb-1">Bill to</p>
          <p className="text-sm text-[var(--color-ink)]">{order.shipName}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}, {order.shipCity}, {order.shipState} {order.shipPincode}
          </p>
          <p className="text-sm text-[var(--color-ink-muted)]">{order.shipPhone}{order.user?.email ? ` · ${order.user.email}` : ""}</p>
        </div>

        {/* Items */}
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-center font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-[var(--color-line)]">
                <td className="py-2 text-[var(--color-ink)]">{i.title}{i.size ? ` · ${i.size}` : ""}</td>
                <td className="py-2 text-center text-[var(--color-ink-muted)]">{i.quantity}</td>
                <td className="py-2 text-right text-[var(--color-ink-muted)]">₹{i.priceInr * i.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto mt-5 max-w-xs">
          <div className={row}><span className="text-[var(--color-ink-muted)]">Subtotal</span><span>₹{subtotal}</span></div>
          <div className={row}><span className="text-[var(--color-ink-muted)]">Shipping</span><span>{order.shippingInr === 0 ? "Free" : `₹${order.shippingInr}`}</span></div>
          {gstOn && (
            <>
              <div className={row}><span className="text-[var(--color-ink-muted)]">Taxable value</span><span>₹{taxableValue}</span></div>
              <div className={row}><span className="text-[var(--color-ink-muted)]">CGST ({rate / 2}%)</span><span>₹{cgst}</span></div>
              <div className={row}><span className="text-[var(--color-ink-muted)]">SGST ({rate / 2}%)</span><span>₹{sgst}</span></div>
            </>
          )}
          <div className="mt-1 flex justify-between border-t border-[var(--color-line)] pt-2 text-base font-semibold text-[var(--color-ink)]">
            <span>Total paid</span><span>₹{order.totalInr}</span>
          </div>
        </div>

        <p className="mt-8 border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-ink-faint)]">
          {gstOn
            ? "Prices are inclusive of GST. This is a computer-generated tax invoice."
            : "This is a computer-generated receipt."}
        </p>
      </div>
    </div>
  );
}
