"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash, Minus, Plus, ShoppingBag } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCart, setQty, removeFromCart, clearCart, CART_EVENT, type CartEntry } from "@/components/app/shop/cart";
import { createShopOrder, verifyShopPayment } from "@/lib/shop-actions";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (e: string, cb: () => void) => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const empty = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };
const field = "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]";

export function CartView() {
  const router = useRouter();
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [addr, setAddr] = useState({ ...empty });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  const total = cart.reduce((sum, c) => sum + c.priceInr * c.quantity, 0);

  const pay = async () => {
    setBusy(true);
    setError(null);
    const res = await createShopOrder({
      items: cart.map((c) => ({ shopItemId: c.id, quantity: c.quantity })),
      address: addr,
    });
    if (!res.ok) { setError(res.error); setBusy(false); return; }

    const loaded = await loadCheckout();
    if (!loaded || !window.Razorpay) { setError("Couldn't load the payment window. Check your connection and try again."); setBusy(false); return; }

    const rzp = new window.Razorpay({
      key: res.keyId,
      order_id: res.orderId,
      amount: res.amountPaise,
      currency: "INR",
      name: "Break It Thru",
      description: "Shop order",
      prefill: { name: res.prefillName, email: res.email, contact: addr.phone },
      theme: { color: "#c5673c" },
      handler: async (resp: RazorpayResponse) => {
        const v = await verifyShopPayment({ orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        if (v.ok) { clearCart(); router.push("/shop/confirmed"); }
        else { setError(v.error ?? "We couldn't confirm the payment."); setBusy(false); }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", () => { setError("The payment failed. Please try again."); setBusy(false); });
    rzp.open();
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Link href="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"><ArrowLeft size={16} /> Back to shop</Link>
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <ShoppingBag size={36} className="text-[var(--color-ink-faint)]" />
          <p className="text-[var(--color-ink-muted)]">Your cart is empty.</p>
          <Link href="/shop"><Button variant="primary" size="sm">Browse the shop</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"><ArrowLeft size={16} /> Back to shop</Link>
      <h1 className="font-display text-[2.5rem] leading-tight text-[var(--color-ink)]">Your cart</h1>

      {/* Items */}
      <Card className="mt-6 p-0">
        {cart.map((c) => (
          <div key={c.id} className="flex items-center gap-4 border-b border-[var(--color-line)] p-4 last:border-0">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)]">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <ShoppingBag size={20} className="text-[var(--color-ink-faint)]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[var(--color-ink)]">{c.title}</p>
              <p className="text-sm text-[var(--color-ink-muted)]">₹{c.priceInr}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(c.id, c.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]"><Minus size={14} /></button>
              <span className="w-7 text-center text-sm">{c.quantity}</span>
              <button onClick={() => setQty(c.id, c.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]"><Plus size={14} /></button>
            </div>
            <button onClick={() => removeFromCart(c.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"><Trash size={15} /></button>
          </div>
        ))}
      </Card>

      {/* Address */}
      <h2 className="mt-8 text-base font-semibold text-[var(--color-ink)]">Shipping address</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Full name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} />
        <input className={field} placeholder="Phone" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} />
        <input className={`${field} sm:col-span-2`} placeholder="Address line 1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
        <input className={`${field} sm:col-span-2`} placeholder="Address line 2 (optional)" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} />
        <input className={field} placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
        <input className={field} placeholder="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
        <input className={field} placeholder="PIN code" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} />
      </div>

      {/* Total + pay */}
      <div className="mt-8 flex items-center justify-between border-t border-[var(--color-line)] pt-5">
        <span className="text-sm text-[var(--color-ink-muted)]">Total</span>
        <span className="font-display text-2xl text-[var(--color-ink)]">₹{total}</span>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex justify-end">
        <Button variant="primary" size="lg" onClick={pay} disabled={busy}>{busy ? "Processing…" : `Pay ₹${total}`}</Button>
      </div>
      <p className="mt-3 text-right text-xs text-[var(--color-ink-faint)]">Secured by Razorpay · UPI, card or netbanking</p>
    </div>
  );
}
