"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, Gift, Star } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { createReward, updateReward, deleteReward } from "@/lib/admin-money-actions";

const KINDS = ["DIGITAL", "DISCOUNT", "PHYSICAL"] as const;
export type RewardItem = { id: string; key: string; title: string; description: string | null; pointsCost: number; kind: string; featured: boolean; active: boolean; order: number };
const empty = { key: "", title: "", description: "", pointsCost: 0, kind: "DIGITAL", featured: false, active: true, order: 0 };

export function RewardManager({ rewards }: { rewards: RewardItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const add = () => { setEditId(null); setForm({ ...empty, order: rewards.length }); setError(null); setOpen(true); };
  const edit = (r: RewardItem) => { setEditId(r.id); setForm({ key: r.key, title: r.title, description: r.description ?? "", pointsCost: r.pointsCost, kind: r.kind, featured: r.featured, active: r.active, order: r.order }); setError(null); setOpen(true); };
  const submit = () =>
    start(async () => {
      setError(null);
      const res = editId ? await updateReward(editId, form) : await createReward(form);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Rewards</h2>
        <Button size="sm" variant="outline" onClick={add}><Plus size={15} /> Add</Button>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rewards.map((r) => (
          <Card key={r.id} className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"><Gift size={16} weight="fill" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-medium text-[var(--color-ink)]">{r.title}</p>
                {r.featured && <Star size={13} weight="fill" className="text-[var(--color-accent)]" />}
                {!r.active && <Chip tone="neutral">hidden</Chip>}
              </div>
              <p className="text-xs text-[var(--color-ink-faint)]">{r.pointsCost} pts · {r.kind.toLowerCase()}</p>
            </div>
            <button onClick={() => edit(r)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={14} /></button>
            <ConfirmButton action={() => deleteReward(r.id)} confirmTitle="Delete this reward?" confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"><Trash size={14} /></ConfirmButton>
          </Card>
        ))}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title={editId ? "Edit reward" : "Add a reward"}
        footer={<div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button><Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button></div>}>
        <Field label="Key" hint="Lowercase, dashes."><input className={inputClass} value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} /></Field>
        <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Description"><input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Points cost"><input type="number" className={inputClass} value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: Number(e.target.value) })} /></Field>
          <Field label="Kind">
            <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              {KINDS.map((k) => <option key={k} value={k}>{k[0] + k.slice(1).toLowerCase()}</option>)}
            </select>
          </Field>
        </div>
        <div className="mb-3 flex items-center justify-between"><span className="text-sm text-[var(--color-ink)]">Featured</span><Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} /></div>
        <div className="mb-4 flex items-center justify-between"><span className="text-sm text-[var(--color-ink)]">Shown in the shop</span><Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} /></div>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
