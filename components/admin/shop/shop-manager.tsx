"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, ShoppingBag, UploadSimple } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { createShopItem, updateShopItem, deleteShopItem, type ShopItemInput } from "@/lib/admin-shop-actions";

export type ShopItemRow = {
  id: string;
  title: string;
  description: string | null;
  priceInr: number;
  imageUrl: string | null;
  stock: number | null;
  active: boolean;
  featured: boolean;
  order: number;
};

const MAX_BYTES = 500 * 1024;
const empty = { title: "", description: "", priceInr: 0, imageUrl: "", stock: "", active: true, featured: false, order: 0 };
type Form = typeof empty;

export function ShopManager({ items }: { items: ShopItemRow[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm({ ...empty }); setError(null); setOpen(true); };
  const openEdit = (it: ShopItemRow) => {
    setEditingId(it.id);
    setForm({
      title: it.title,
      description: it.description ?? "",
      priceInr: it.priceInr,
      imageUrl: it.imageUrl ?? "",
      stock: it.stock === null ? "" : String(it.stock),
      active: it.active,
      featured: it.featured,
      order: it.order,
    });
    setError(null);
    setOpen(true);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > MAX_BYTES) { setError("That image is over 500 KB. Please choose a smaller one."); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const submit = () =>
    start(async () => {
      setError(null);
      const payload: ShopItemInput = {
        title: form.title,
        description: form.description,
        priceInr: form.priceInr,
        imageUrl: form.imageUrl || null,
        stock: form.stock === "" ? null : Number(form.stock),
        active: form.active,
        featured: form.featured,
        order: form.order,
      };
      const res = editingId ? await updateShopItem(editingId, payload) : await createShopItem(payload);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={openAdd}><Plus size={16} /> Add an item</Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[var(--color-ink-muted)]">No items yet. Add your first product.</Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                        {it.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag size={18} />
                        )}
                      </span>
                      <span className="font-medium text-[var(--color-ink)]">{it.title}{it.featured && <Chip tone="brand" className="ml-2">Featured</Chip>}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">₹{it.priceInr}</td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">{it.stock === null ? "∞" : it.stock}</td>
                  <td className="px-3 py-3">
                    <Chip tone={it.active ? "success" : "neutral"} className="uppercase tracking-wide">{it.active ? "Live" : "Hidden"}</Chip>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1 text-[var(--color-ink-muted)]">
                      <button onClick={() => openEdit(it)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]"><PencilSimple size={15} /></button>
                      <ConfirmButton action={() => deleteShopItem(it.id)} confirmTitle="Delete this item?" confirmCta="Delete" className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]">
                        <Trash size={15} />
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit item" : "Add an item"}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button>
            <Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Description" hint="A short line shown under the title.">
          <textarea className={`${inputClass} min-h-20`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Price (₹)">
          <input type="number" min={0} className={inputClass} value={form.priceInr} onChange={(e) => setForm({ ...form, priceInr: Number(e.target.value) })} />
        </Field>
        <Field label="Image" hint="Optional. PNG, JPG, WEBP or GIF up to 500 KB.">
          <div className="flex flex-col gap-2">
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="Preview" className="h-28 w-full rounded-[var(--radius-md)] object-cover" />
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}><UploadSimple size={16} /> {form.imageUrl ? "Replace" : "Upload"}</Button>
              {form.imageUrl && <Button size="sm" variant="outline" onClick={() => setForm({ ...form, imageUrl: "" })}>Remove</Button>}
            </div>
          </div>
        </Field>
        <Field label="Stock" hint="Leave blank for unlimited.">
          <input type="number" min={0} className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </Field>
        <Field label="Display order" hint="Lower shows first.">
          <input type="number" min={0} className={inputClass} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
        </Field>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-[var(--color-ink)]">Live in the shop</span>
          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-[var(--color-ink)]">Featured</span>
          <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
        </div>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
