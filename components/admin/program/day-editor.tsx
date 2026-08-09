"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, PencilSimple, Trash, ArrowUp, ArrowDown, VideoCamera } from "@phosphor-icons/react";
import { Card, Chip } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Drawer, Field, inputClass } from "@/components/admin/drawer";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { VideoUpload } from "@/components/admin/program/video-upload";
import {
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  updateDay,
  createVideo,
  deleteVideo,
} from "@/lib/admin-program-actions";

const CATEGORIES = ["MENTAL", "PHYSICAL", "REFLECTION", "PRACTICE", "CONNECTION"] as const;
const RESPONSES = ["NONE", "WRITTEN", "TIMER", "TAP"] as const;

export type TaskRow = {
  id: string;
  order: number;
  title: string;
  category: string;
  responseType: string;
  estimatedMinutes: number;
  points: number;
  mandatory: boolean;
  whyItMatters: string | null;
  videoCount: number;
};
export type VideoRow = { id: string; title: string; streamUid: string | null; durationSec: number | null };

const empty = {
  title: "",
  category: "PRACTICE",
  responseType: "NONE",
  estimatedMinutes: 5,
  points: 1,
  mandatory: true,
  whyItMatters: "",
};

export function DayEditor({
  dayNumber,
  title,
  isMilestone,
  tasks,
  videos,
  streamConfigured,
}: {
  dayNumber: number;
  title: string | null;
  isMilestone: boolean;
  tasks: TaskRow[];
  videos: VideoRow[];
  streamConfigured: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Day settings
  const [dayTitle, setDayTitle] = useState(title ?? "");
  const [milestone, setMilestone] = useState(isMilestone);

  const saveDay = () =>
    start(async () => {
      await updateDay(dayNumber, { title: dayTitle, isMilestone: milestone });
      router.refresh();
    });

  // Task drawer
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...empty });
    setError(null);
    setTaskOpen(true);
  };
  const openEdit = (t: TaskRow) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      category: t.category,
      responseType: t.responseType,
      estimatedMinutes: t.estimatedMinutes,
      points: t.points,
      mandatory: t.mandatory,
      whyItMatters: t.whyItMatters ?? "",
    });
    setError(null);
    setTaskOpen(true);
  };

  const submitTask = () =>
    start(async () => {
      setError(null);
      const res = editingId ? await updateTask(editingId, form) : await createTask(dayNumber, form);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTaskOpen(false);
      router.refresh();
    });

  // Video drawer
  const [videoOpen, setVideoOpen] = useState(false);
  const [vForm, setVForm] = useState({ title: "", streamUid: "", durationSec: 0 });
  const [vError, setVError] = useState<string | null>(null);
  const submitVideo = () =>
    start(async () => {
      setVError(null);
      const res = await createVideo({ dayNumber, title: vForm.title, streamUid: vForm.streamUid, durationSec: vForm.durationSec });
      if (!res.ok) {
        setVError(res.error);
        return;
      }
      setVideoOpen(false);
      setVForm({ title: "", streamUid: "", durationSec: 0 });
      router.refresh();
    });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Tasks */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Tasks</h2>
          <Button size="sm" variant="outline" onClick={openAdd}>
            <Plus size={16} /> Add a task
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {tasks.length === 0 && <p className="text-sm text-[var(--color-ink-muted)]">No tasks yet. Add the first one.</p>}
          {tasks.map((t, i) => (
            <Card key={t.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-[var(--color-ink)]">{t.title}</p>
                  {!t.mandatory && <Chip tone="neutral">optional</Chip>}
                </div>
                <p className="mt-0.5 text-xs text-[var(--color-ink-faint)]">
                  {t.category[0] + t.category.slice(1).toLowerCase()} · {t.estimatedMinutes} min · +{t.points} · {t.responseType.toLowerCase()}
                  {t.videoCount > 0 ? ` · ${t.videoCount} video` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-[var(--color-ink-muted)]">
                <button disabled={i === 0 || pending} onClick={() => start(async () => { await moveTask(t.id, "up"); router.refresh(); })} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)] disabled:opacity-30">
                  <ArrowUp size={15} />
                </button>
                <button disabled={i === tasks.length - 1 || pending} onClick={() => start(async () => { await moveTask(t.id, "down"); router.refresh(); })} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)] disabled:opacity-30">
                  <ArrowDown size={15} />
                </button>
                <button onClick={() => openEdit(t)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--color-surface-sunken)]">
                  <PencilSimple size={15} />
                </button>
                <ConfirmButton
                  action={() => deleteTask(t.id)}
                  confirmTitle="Delete this task?"
                  confirmBody="It will be removed from this day for everyone."
                  confirmCta="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"
                >
                  <Trash size={15} />
                </ConfirmButton>
              </div>
            </Card>
          ))}
        </div>

        {/* Day videos */}
        <div className="mb-3 mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Day videos</h2>
          <Button size="sm" variant="outline" onClick={() => setVideoOpen(true)}>
            <Plus size={16} /> Add a video
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {videos.length === 0 && <p className="text-sm text-[var(--color-ink-muted)]">No day-level videos.</p>}
          {videos.map((v) => (
            <Card key={v.id} className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                <VideoCamera size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-ink)]">{v.title}</p>
                <p className="text-xs text-[var(--color-ink-faint)]">{v.streamUid ? "Ready" : "No stream id yet"}</p>
              </div>
              <ConfirmButton
                action={() => deleteVideo(v.id)}
                confirmTitle="Delete this video?"
                confirmCta="Delete"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-crisis)] hover:bg-[var(--color-crisis-subtle)]"
              >
                <Trash size={15} />
              </ConfirmButton>
            </Card>
          ))}
        </div>
      </div>

      {/* Day settings */}
      <aside>
        <Card className="p-5">
          <h3 className="font-semibold text-[var(--color-ink)]">This day</h3>
          <Field label="Title (optional)">
            <input className={inputClass} value={dayTitle} onChange={(e) => setDayTitle(e.target.value)} placeholder={`Day ${dayNumber}`} />
          </Field>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-ink)]">Milestone day</span>
            <Toggle checked={milestone} onChange={setMilestone} />
          </div>
          <Button size="sm" variant="primary" onClick={saveDay} disabled={pending} className="w-full">
            {pending ? "Saving…" : "Save day"}
          </Button>
        </Card>
      </aside>

      {/* Task drawer */}
      <Drawer
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        title={editingId ? "Edit task" : "Add task"}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setTaskOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
              Cancel
            </button>
            <Button size="sm" variant="primary" onClick={submitTask} disabled={pending}>
              {pending ? "Saving…" : "Save task"}
            </Button>
          </div>
        }
      >
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c[0] + c.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
          <Field label="Response">
            <select className={inputClass} value={form.responseType} onChange={(e) => setForm({ ...form, responseType: e.target.value })}>
              {RESPONSES.map((r) => (
                <option key={r} value={r}>{r[0] + r.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
          <Field label="Minutes">
            <input type="number" className={inputClass} value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
          </Field>
          <Field label="Points">
            <input type="number" className={inputClass} value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-[var(--color-ink)]">Mandatory</span>
          <Toggle checked={form.mandatory} onChange={(v) => setForm({ ...form, mandatory: v })} />
        </div>
        <Field label="Why it matters (optional)">
          <textarea rows={3} className={inputClass} value={form.whyItMatters} onChange={(e) => setForm({ ...form, whyItMatters: e.target.value })} />
        </Field>
        {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
      </Drawer>

      {/* Video drawer */}
      <Drawer
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        title="Add a video"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setVideoOpen(false)} className="rounded-[var(--radius-pill)] px-4 py-2 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]">
              Cancel
            </button>
            <Button size="sm" variant="primary" onClick={submitVideo} disabled={pending}>
              {pending ? "Saving…" : "Add video"}
            </Button>
          </div>
        }
      >
        <Field label="Title">
          <input className={inputClass} value={vForm.title} onChange={(e) => setVForm({ ...vForm, title: e.target.value })} />
        </Field>
        <Field label="Video" hint="Upload a clip and it goes straight to Cloudflare. It becomes Ready after transcoding.">
          <VideoUpload value={vForm.streamUid} onChange={(uid) => setVForm({ ...vForm, streamUid: uid })} configured={streamConfigured} />
        </Field>
        {vError && <p className="text-sm text-[var(--color-crisis)]">{vError}</p>}
      </Drawer>
    </div>
  );
}
