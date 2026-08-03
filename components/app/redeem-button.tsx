"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "@phosphor-icons/react";
import { redeemReward } from "@/lib/actions";

export function RedeemButton({
  rewardId,
  pointsCost,
  affordable,
}: {
  rewardId: string;
  pointsCost: number;
  affordable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!affordable) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-sunken)] px-4 py-2.5 text-sm text-[var(--color-ink-muted)]">
        <Lock size={14} /> {pointsCost} points
      </span>
    );
  }

  async function redeem() {
    setBusy(true);
    setError("");
    const res = await redeemReward(rewardId);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Could not redeem");
      return;
    }
    router.push(`/progress/rewards/${res.key}`);
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        onClick={redeem}
        disabled={busy}
        className="rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-accent-fg)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
      >
        {busy ? "Redeeming…" : `Redeem · ${pointsCost} points`}
      </button>
      {error && <p className="mt-1 text-xs text-[var(--color-crisis)]">{error}</p>}
    </div>
  );
}
