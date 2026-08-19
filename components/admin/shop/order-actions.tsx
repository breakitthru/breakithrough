"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/admin/drawer";
import { updateOrderFulfilment } from "@/lib/admin-shop-actions";

type Status = "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUSES: { value: Status; label: string }[] = [
  { value: "PAID", label: "Paid · packing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function OrderActions({
  id,
  status,
  etaAt,
  trackingCarrier,
  trackingNumber,
  trackingUrl,
}: {
  id: string;
  status: string;
  etaAt: string | null; // yyyy-mm-dd
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    status: (["PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status) ? status : "PAID") as Status,
    etaAt: etaAt ?? "",
    trackingCarrier: trackingCarrier ?? "",
    trackingNumber: trackingNumber ?? "",
    trackingUrl: trackingUrl ?? "",
  });

  const save = () =>
    start(async () => {
      setError(null);
      const res = await updateOrderFulfilment(id, form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });

  const shipping = form.status === "SHIPPED" || form.status === "DELIVERED";

  return (
    <div className="mt-4 border-t border-[var(--color-line)] pt-4">
      <p className="eyebrow mb-2">Fulfilment</p>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setForm({ ...form, status: s.value })}
            className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-sm transition-colors ${
              form.status === s.value
                ? "bg-[var(--color-brand)] text-[var(--color-brand-fg)]"
                : "border border-[var(--color-line-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {shipping && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Estimated delivery</span>
            <input type="date" className={inputClass} value={form.etaAt} onChange={(e) => setForm({ ...form, etaAt: e.target.value })} />
          </label>
          <label className="block">
            <span className="eyebrow">Courier</span>
            <input className={inputClass} value={form.trackingCarrier} onChange={(e) => setForm({ ...form, trackingCarrier: e.target.value })} placeholder="Delhivery" />
          </label>
          <label className="block">
            <span className="eyebrow">Tracking number</span>
            <input className={inputClass} value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} placeholder="AWB / tracking id" />
          </label>
          <label className="block">
            <span className="eyebrow">Tracking link</span>
            <input className={inputClass} value={form.trackingUrl} onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })} placeholder="https://…" />
          </label>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-[var(--color-crisis)]">{error}</p>}

      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="primary" onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
