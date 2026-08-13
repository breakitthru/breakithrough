"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPaymentOrder, verifyPayment, validatePromo } from "@/lib/payment-actions";

/*
  Program checkout: optional promo code + the pay button. The promo is validated
  server-side for preview, and re-priced again server-side at order creation. A
  fully-discounted code skips Razorpay entirely.
*/

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

const inputClass =
  "h-11 flex-1 rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] px-3 text-sm outline-none focus:border-[var(--color-accent)]";

export function CheckoutPanel({ amountInr }: { amountInr: number }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; discountInr: number; finalInr: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalInr = applied ? applied.finalInr : amountInr;

  const apply = async () => {
    setApplying(true);
    setPromoError(null);
    const res = await validatePromo(code);
    if (res.ok) setApplied({ code: code.trim().toUpperCase(), discountInr: res.discountInr, finalInr: res.finalInr });
    else { setApplied(null); setPromoError(res.error); }
    setApplying(false);
  };

  const removePromo = () => { setApplied(null); setCode(""); setPromoError(null); };

  const pay = async () => {
    setBusy(true);
    setError(null);
    const order = await createPaymentOrder(applied?.code);
    if (!order.ok) { setError(order.error); setBusy(false); return; }
    if (order.free) { router.push("/checkout/confirmed"); return; }

    const loaded = await loadCheckout();
    if (!loaded || !window.Razorpay) { setError("Couldn't load the payment window. Check your connection and try again."); setBusy(false); return; }

    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Break It Thru",
      description: "Full 60-day program",
      prefill: { name: order.prefillName, email: order.email },
      theme: { color: "#c5673c" },
      handler: async (resp: RazorpayResponse) => {
        const res = await verifyPayment({ orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        if (res.ok) router.push("/checkout/confirmed");
        else { setError(res.error ?? "We couldn't confirm the payment."); setBusy(false); }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", () => router.push("/checkout/failed"));
    rzp.open();
  };

  return (
    <div>
      {/* Promo */}
      <details className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4" open={!!applied}>
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-ink)]">Have a promo code?</summary>
        {applied ? (
          <div className="mt-3 flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-success-subtle)] px-3 py-2 text-sm">
            <span className="text-[var(--color-success)]">
              <span className="font-semibold">{applied.code}</span> applied — ₹{applied.discountInr} off
            </span>
            <button onClick={removePromo} className="text-[var(--color-ink-muted)] underline-offset-2 hover:underline">Remove</button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <input className={inputClass} placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} />
            <Button variant="outline" size="sm" onClick={apply} disabled={applying || !code.trim()}>{applying ? "Checking…" : "Apply"}</Button>
          </div>
        )}
        {promoError && <p className="mt-2 text-sm text-[var(--color-crisis)]">{promoError}</p>}
      </details>

      {/* Total + pay */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-line)] pt-5">
        <span className="text-sm text-[var(--color-ink-muted)]">Total</span>
        <span className="font-display text-2xl text-[var(--color-ink)]">
          {applied && applied.discountInr > 0 && (
            <span className="mr-2 text-base text-[var(--color-ink-faint)] line-through">₹{amountInr}</span>
          )}
          ₹{finalInr}
        </span>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}
      <div className="mt-4 flex justify-end">
        <Button variant="primary" size="lg" onClick={pay} disabled={busy}>
          {busy ? "Processing…" : finalInr <= 0 ? "Get full access" : `Pay ₹${finalInr}`}
        </Button>
      </div>
    </div>
  );
}
