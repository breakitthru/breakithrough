"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, FileText } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { savePolicy, deletePolicy } from "@/lib/admin-settings-actions";

export type PolicyItem = { key: string; title: string; version: number; body: string; liveSince: string | null };
const empty = { key: "", title: "", body: "" };

export function PolicyManager({ policies }: { policies: PolicyItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const add = () => { setIsNew(true); setForm({ ...empty }); setError(null); setOpen(true); };
  const edit = (p: PolicyItem) => { setIsNew(false); setForm({ key: p.key, title: p.title, body: p.body }); setError(null); setOpen(true); };
  const submit = () =>
    start(async () => {
      setError(null);
      const res = await savePolicy(form);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Policies</h2>
        <Button size="sm" variant="outline" onClick={add}><Plus size={15} /> Add</Button>
      </div>
      {policies.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[var(--color-ink-muted)]">No policies yet. Add your privacy policy, terms, and refunds.</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {policies.map((p) => (
            <Card key={p.key} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-subtle)] text-[var(--color-brand-subtle-ink)]"><FileText size={16} weight="fill" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-[var(--color-ink)]">{p.title}</p>
                  <Chip tone="neutral">v{p.version}</Chip>
                </div>
                <p className="text-xs text-[var(--color-ink-faint)]">{p.liveSince ? `Live since ${new Date(p.liveSince).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Draft"}</p>
              </div>
              <button onClick={() => edit(p)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={15} /></button>
              <ConfirmButton action={() => deletePolicy(p.key)} confirmTitle="Delete this policy?" confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"><Trash size={15} /></ConfirmButton>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={open} onClose={() => setOpen(false)} title={isNew ? "Add a policy" : "Edit policy"}
        footer={<div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button><Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Publish"}</Button></div>}>
        <Field label="Key" hint="e.g. privacy, terms, refunds. Editing bumps the version.">
          <input className={inputClass} value={form.key} disabled={!isNew} onChange={(e) => setForm({ ...form, key: e.target.value })} />
        </Field>
        <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
        <Field label="Body">
          <textarea rows={12} className={inputClass} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </Field>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
