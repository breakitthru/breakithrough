"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple, Trash, Plus, Trophy } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { updatePhase, createBadge, updateBadge, deleteBadge } from "@/lib/admin-program-actions";

const CRIT_TYPES = ["tasks", "reflections", "days", "full_days", "day_reached"] as const;
const CRIT_LABEL: Record<string, string> = {
  tasks: "Tasks completed",
  reflections: "Reflections written",
  days: "Days shown up",
  full_days: "Full days finished",
  day_reached: "Reached day",
};

export type PhaseItem = { order: number; name: string; dayStart: number; dayEnd: number };
export type BadgeItem = { id: string; key: string; name: string; description: string; order: number; critType: string; critN: number };

export function PhaseBadgeManager({ phases, badges }: { phases: PhaseItem[]; badges: BadgeItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Phase drawer
  const [pOpen, setPOpen] = useState(false);
  const [pForm, setPForm] = useState<PhaseItem>({ order: 1, name: "", dayStart: 1, dayEnd: 1 });
  const [pError, setPError] = useState<string | null>(null);
  const editPhase = (p: PhaseItem) => { setPForm(p); setPError(null); setPOpen(true); };
  const savePhase = () =>
    start(async () => {
      setPError(null);
      const res = await updatePhase(pForm.order, { name: pForm.name, dayStart: pForm.dayStart, dayEnd: pForm.dayEnd });
      if (!res.ok) { setPError(res.error); return; }
      setPOpen(false);
      router.refresh();
    });

  // Badge drawer
  const emptyB = { key: "", name: "", description: "", order: badges.length, critType: "tasks", critN: 1 };
  const [bOpen, setBOpen] = useState(false);
  const [bId, setBId] = useState<string | null>(null);
  const [bForm, setBForm] = useState({ ...emptyB });
  const [bError, setBError] = useState<string | null>(null);
  const addBadge = () => { setBId(null); setBForm({ ...emptyB, order: badges.length }); setBError(null); setBOpen(true); };
  const editBadge = (b: BadgeItem) => { setBId(b.id); setBForm({ key: b.key, name: b.name, description: b.description, order: b.order, critType: b.critType, critN: b.critN }); setBError(null); setBOpen(true); };
  const saveBadge = () =>
    start(async () => {
      setBError(null);
      const res = bId ? await updateBadge(bId, bForm) : await createBadge(bForm);
      if (!res.ok) { setBError(res.error); return; }
      setBOpen(false);
      router.refresh();
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Phases */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">Phases</h2>
        <div className="flex flex-col gap-2">
          {phases.map((p) => (
            <Card key={p.order} className="flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-sm font-semibold text-[var(--color-brand-subtle-ink)]">{p.order}</span>
              <div className="flex-1">
                <p className="font-medium text-[var(--color-ink)]">{p.name}</p>
                <p className="text-xs text-[var(--color-ink-faint)]">Days {p.dayStart}–{p.dayEnd}</p>
              </div>
              <button onClick={() => editPhase(p)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
                <PencilSimple size={15} />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Badges</h2>
          <Button size="sm" variant="outline" onClick={addBadge}><Plus size={15} /> Add</Button>
        </div>
        <div className="flex flex-col gap-2">
          {badges.map((b) => (
            <Card key={b.id} className="flex items-center gap-3 p-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"><Trophy size={16} weight="fill" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-ink)]">{b.name}</p>
                <p className="truncate text-xs text-[var(--color-ink-faint)]">{CRIT_LABEL[b.critType]} · {b.critN}</p>
              </div>
              <button onClick={() => editBadge(b)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={14} /></button>
              <ConfirmButton action={() => deleteBadge(b.id)} confirmTitle="Delete this badge?" confirmBody="Members who earned it keep nothing here after deletion." confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]">
                <Trash size={14} />
              </ConfirmButton>
            </Card>
          ))}
        </div>
      </div>

      {/* Phase drawer */}
      <Drawer open={pOpen} onClose={() => setPOpen(false)} title={`Edit phase ${pForm.order}`}
        footer={<div className="flex justify-end gap-2"><button onClick={() => setPOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button><Button size="sm" variant="primary" onClick={savePhase} disabled={pending}>{pending ? "Saving…" : "Save"}</Button></div>}>
        <Field label="Name"><input className={inputClass} value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Day start"><input type="number" className={inputClass} value={pForm.dayStart} onChange={(e) => setPForm({ ...pForm, dayStart: Number(e.target.value) })} /></Field>
          <Field label="Day end"><input type="number" className={inputClass} value={pForm.dayEnd} onChange={(e) => setPForm({ ...pForm, dayEnd: Number(e.target.value) })} /></Field>
        </div>
        {pError && <p className="text-sm text-[var(--color-crisis)]">{pError}</p>}
      </Drawer>

      {/* Badge drawer */}
      <Drawer open={bOpen} onClose={() => setBOpen(false)} title={bId ? "Edit badge" : "Add a badge"}
        footer={<div className="flex justify-end gap-2"><button onClick={() => setBOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button><Button size="sm" variant="primary" onClick={saveBadge} disabled={pending}>{pending ? "Saving…" : "Save"}</Button></div>}>
        <Field label="Key" hint="Lowercase, dashes. Used internally; don't reuse."><input className={inputClass} value={bForm.key} onChange={(e) => setBForm({ ...bForm, key: e.target.value })} /></Field>
        <Field label="Name"><input className={inputClass} value={bForm.name} onChange={(e) => setBForm({ ...bForm, name: e.target.value })} /></Field>
        <Field label="Description"><input className={inputClass} value={bForm.description} onChange={(e) => setBForm({ ...bForm, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Earned by">
            <select className={inputClass} value={bForm.critType} onChange={(e) => setBForm({ ...bForm, critType: e.target.value })}>
              {CRIT_TYPES.map((c) => <option key={c} value={c}>{CRIT_LABEL[c]}</option>)}
            </select>
          </Field>
          <Field label="Count / day"><input type="number" className={inputClass} value={bForm.critN} onChange={(e) => setBForm({ ...bForm, critN: Number(e.target.value) })} /></Field>
        </div>
        {bError && <p className="text-sm text-[var(--color-crisis)]">{bError}</p>}
      </Drawer>
    </div>
  );
}
