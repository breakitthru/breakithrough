"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, Tag } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { createPromo, updatePromo, deletePromo, type PromoInput } from "@/lib/admin-promo-actions";

export type PromoRow = {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  value: number;
  active: boolean;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null; // ISO or null
};

const empty = { code: "", discountType: "PERCENT" as "PERCENT" | "FLAT", value: 10, active: true, maxRedemptions: "", expiresAt: "" };
type Form = typeof empty;

export function PromoManager({ promos }: { promos: PromoRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm({ ...empty }); setError(null); setOpen(true); };
  const openEdit = (p: PromoRow) => {
    setEditingId(p.id);
    setForm({
      code: p.code,
      discountType: p.discountType,
      value: p.value,
      active: p.active,
      maxRedemptions: p.maxRedemptions === null ? "" : String(p.maxRedemptions),
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
    });
    setError(null);
    setOpen(true);
  };

  const submit = () =>
    start(async () => {
      setError(null);
      const payload: PromoInput = {
        code: form.code,
        discountType: form.discountType,
        value: form.value,
        active: form.active,
        maxRedemptions: form.maxRedemptions === "" ? null : Number(form.maxRedemptions),
        expiresAt: form.expiresAt || null,
      };
      const res = editingId ? await updatePromo(editingId, payload) : await createPromo(payload);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={openAdd}><Plus size={16} /> Add a code</Button>
      </div>

      {promos.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[var(--color-ink-muted)]">No promo codes yet.</Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Discount</th>
                <th className="px-3 py-3 font-medium">Used</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const expired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
                return (
                  <tr key={p.id} className="border-b border-[var(--color-line)] last:border-0">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]"><Tag size={15} className="text-[var(--color-ink-muted)]" /> {p.code}</span>
                    </td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{p.discountType === "PERCENT" ? `${p.value}% off` : `₹${p.value} off`}</td>
                    <td className="px-3 py-3 text-[var(--color-ink-muted)]">{p.redeemedCount}{p.maxRedemptions !== null ? ` / ${p.maxRedemptions}` : ""}</td>
                    <td className="px-3 py-3">
                      <Chip tone={p.active && !expired ? "success" : "neutral"} className="uppercase tracking-wide">
                        {!p.active ? "Off" : expired ? "Expired" : "Live"}
                      </Chip>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1 text-[var(--color-ink-muted)]">
                        <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={15} /></button>
                        <ConfirmButton action={() => deletePromo(p.id)} confirmTitle="Delete this code?" confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]">
                          <Trash size={15} />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit code" : "Add a code"}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button>
            <Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <Field label="Code" hint="Case-insensitive; shown to members as they type.">
          <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </Field>
        <Field label="Discount type">
          <select className={inputClass} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENT" | "FLAT" })}>
            <option value="PERCENT">Percentage off</option>
            <option value="FLAT">Flat rupees off</option>
          </select>
        </Field>
        <Field label={form.discountType === "PERCENT" ? "Percent off (1–100)" : "Rupees off"}>
          <input type="number" min={1} className={inputClass} value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        </Field>
        <Field label="Max redemptions" hint="Leave blank for unlimited.">
          <input type="number" min={1} className={inputClass} value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
        </Field>
        <Field label="Expires on" hint="Optional.">
          <input type="date" className={inputClass} value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
        </Field>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-[var(--color-ink)]">Active</span>
          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </div>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
