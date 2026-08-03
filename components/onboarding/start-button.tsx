"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { startTrial } from "@/lib/actions";

export function StartButton() {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="accent"
      size="lg"
      disabled={busy}
      onClick={() => {
        setBusy(true);
        startTrial();
      }}
    >
      {busy ? "Setting up…" : "Start Day 1"}
    </Button>
  );
}
