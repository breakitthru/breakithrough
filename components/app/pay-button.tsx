"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completePaymentStub } from "@/lib/actions";

// Placeholder pay button — triggers the stub that marks the account paid.
// Swap for the Razorpay checkout handler once keys are wired.
export function PayButton({ amountInr }: { amountInr: number }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="primary"
      size="lg"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        completePaymentStub();
      }}
    >
      {busy ? "Processing…" : `Pay ₹${amountInr}`}
    </Button>
  );
}
