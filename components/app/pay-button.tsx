"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPaymentOrder, verifyPayment } from "@/lib/payment-actions";

/*
  Opens Razorpay Checkout: asks the server for an order, loads checkout.js on
  demand, then verifies the result server-side before sending the member to the
  confirmation page. The webhook backs this up if the browser closes early.
*/

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
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

export function PayButton({ amountInr }: { amountInr: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);

    const order = await createPaymentOrder();
    if (!order.ok) {
      setError(order.error);
      setBusy(false);
      return;
    }

    const loaded = await loadCheckout();
    if (!loaded || !window.Razorpay) {
      setError("Couldn't load the payment window. Check your connection and try again.");
      setBusy(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: "INR",
      name: "Break It Thru",
      description: "Full 60-day program",
      prefill: { name: order.prefillName, email: order.email },
      theme: { color: "#c5673c" },
      handler: async (resp: RazorpayHandlerResponse) => {
        const res = await verifyPayment({
          orderId: resp.razorpay_order_id,
          paymentId: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
        });
        if (res.ok) {
          router.push("/checkout/confirmed");
        } else {
          setError(res.error ?? "We couldn't confirm the payment.");
          setBusy(false);
        }
      },
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", () => router.push("/checkout/failed"));
    rzp.open();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="primary" size="lg" disabled={busy} onClick={pay}>
        {busy ? "Processing…" : `Pay ₹${amountInr}`}
      </Button>
      {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
    </div>
  );
}
