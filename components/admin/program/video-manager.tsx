"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, VideoCamera } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { createVideo, updateVideo, deleteVideo } from "@/lib/admin-program-actions";

export type VideoItem = {
  id: string;
  title: string;
  dayNumber: number;
  streamUid: string | null;
  durationSec: number | null;
};

const emptyV = { title: "", dayNumber: 1, streamUid: "", durationSec: 0 };

export function VideoManager({ videos }: { videos: VideoItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyV });
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setForm({ ...emptyV }); setError(null); setOpen(true); };
  const openEdit = (v: VideoItem) => {
    setEditingId(v.id);
    setForm({ title: v.title, dayNumber: v.dayNumber, streamUid: v.streamUid ?? "", durationSec: v.durationSec ?? 0 });
    setError(null);
    setOpen(true);
  };

  const submit = () =>
    start(async () => {
      setError(null);
      const res = editingId ? await updateVideo(editingId, form) : await createVideo(form);
      if (!res.ok) { setError(res.error); return; }
      setOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={openAdd}>
          <Plus size={16} /> Add a video
        </Button>
      </div>

      {videos.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[var(--color-ink-muted)]">No videos yet.</Card>
      ) : (
        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-left text-xs uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Clip</th>
                <th className="px-3 py-3 font-medium">Used on</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                        <VideoCamera size={18} />
                      </span>
                      <span className="font-medium text-[var(--color-ink)]">{v.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[var(--color-ink-muted)]">Day {v.dayNumber}</td>
                  <td className="px-3 py-3">
                    <Chip tone={v.streamUid ? "success" : "neutral"} className="uppercase tracking-wide">
                      {v.streamUid ? "Ready" : "No file"}
                    </Chip>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1 text-[var(--color-ink-muted)]">
                      <button onClick={() => openEdit(v)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]">
                        <PencilSimple size={15} />
                      </button>
                      <ConfirmButton
                        action={() => deleteVideo(v.id)}
                        confirmTitle="Delete this clip?"
                        confirmCta="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"
                      >
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
        title={editingId ? "Edit clip" : "Add a video"}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">Cancel</button>
            <Button size="sm" variant="primary" onClick={submit} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="Day" hint="Which day this clip belongs to (1–60).">
          <input type="number" min={1} max={60} className={inputClass} value={form.dayNumber} onChange={(e) => setForm({ ...form, dayNumber: Number(e.target.value) })} />
        </Field>
        <Field label="Cloudflare Stream id (optional)" hint="Leave blank until the clip is uploaded and transcoded.">
          <input className={inputClass} value={form.streamUid} onChange={(e) => setForm({ ...form, streamUid: e.target.value })} />
        </Field>
        <Field label="Duration (seconds)">
          <input type="number" className={inputClass} value={form.durationSec} onChange={(e) => setForm({ ...form, durationSec: Number(e.target.value) })} />
        </Field>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>
    </>
  );
}
