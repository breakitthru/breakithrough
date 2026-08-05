"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, Phone } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { createHelpline, updateHelpline, deleteHelpline } from "@/lib/admin-safety-actions";

export type HelplineItem = { id: string; name: string; phone: string; hours: string | null; languages: string | null; active: boolean; order: number };
const empty = { name: "", phone: "", hours: "", languages: "", active: true, order: 0 };

export function HelplineManager({ helplines }: { helplines: HelplineItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const add = () => { setEditId(null); setForm({ ...empty, order: helplines.length }); setError(null); setOpen(true); };
  const edit = (h: HelplineItem) => { setEditId(h.id); setForm({ name: h.name, phone: h.phone, hours: h.hours ?? "", languages: h.languages ?? "", active: h.active, order: h.order }); setError(null); setOpen(true); };
  const submit = () =>
    start(async () => {
      setError(null);
      const res = editId ? await updateHelpline(editId, form) : await createHelpline(form);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Helplines members see</h2>
        <Button size="sm" variant="outline" onClick={add}><Plus size={15} /> Add</Button>
      </div>
      <div className="flex flex-col gap-2">
        {helplines.map((h) => (
          <Card key={h.id} className="flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]"><Phone size={16} weight="fill" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[var(--color-ink)]">{h.name}</p>
                {!h.active && <Chip tone="neutral">hidden</Chip>}
              </div>
              <p className="text-xs text-[var(--color-ink-faint)]">{h.phone} · {h.hours ?? "—"} · {h.languages ?? "—"}</p>
            </div>
            <button onClick={() => edit(h)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={15} /></button>
            <ConfirmButton action={() => deleteHelpline(h.id)} confirmTitle="Delete this helpline?" confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"><Trash size={15} /></ConfirmButton>
          </Card>
        ))}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title={editId ? "Edit helpline" : "Add a helpline"}
        footer={<div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button><Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button></div>}>
        <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hours"><input className={inputClass} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></Field>
          <Field label="Languages"><input className={inputClass} value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></Field>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-[var(--color-ink)]">Shown to members</span>
          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </div>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
