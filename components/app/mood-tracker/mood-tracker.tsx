"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { PencilSimple, ChartLineUp, Rows, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import {
  MOOD_LEVELS,
  ANX_LEVELS,
  FREQ_LEVELS,
  DEFAULT_TRIGGERS,
  MOOD_MIN,
  MOOD_MAX,
  ANX_MIN,
  ANX_MAX,
  moodColor,
  anxColor,
  moodLabel,
  localDateStr,
  type MoodEntry,
} from "@/lib/mood-tracker";
import { saveMoodEntry, deleteMoodEntry } from "@/lib/mood-tracker-actions";
import { TrendLine, Sparkline, HBars, VBars } from "@/components/app/mood-tracker/charts";

type Tab = "log" | "dashboard" | "history";

type Draft = {
  date: string;
  mood: number | null;
  intensity: number | null;
  frequency: number | null;
  triggers: string[];
  notes: string;
};

function toMap(list: MoodEntry[]): Record<string, MoodEntry> {
  const m: Record<string, MoodEntry> = {};
  for (const e of list) m[e.date] = e;
  return m;
}

function avg(nums: number[]): number | null {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
}

export function MoodTracker({ initialEntries }: { initialEntries: MoodEntry[] }) {
  const [entries, setEntries] = useState<Record<string, MoodEntry>>(() => toMap(initialEntries));
  const [tab, setTab] = useState<Tab>("log");

  // "Today" depends on the viewer's local timezone, so compute it on the client
  // only (after mount) to avoid a server/client hydration mismatch.
  const [today, setToday] = useState("");
  const [draft, setDraft] = useState<Draft>({
    date: "",
    mood: null,
    intensity: null,
    frequency: null,
    triggers: [],
    notes: "",
  });

  useEffect(() => {
    const t = localDateStr();
    setToday(t);
    setDraft((d) => {
      // Don't clobber an entry the user already started editing.
      if (d.date) return d;
      const e = entries[t];
      return e ? { ...e } : { date: t, mood: null, intensity: null, frequency: null, triggers: [], notes: "" };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customTrigger, setCustomTrigger] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // The trigger palette: defaults plus anything used in saved entries or added this session.
  const triggerList = useMemo(() => {
    const set = new Set<string>(DEFAULT_TRIGGERS);
    Object.values(entries).forEach((e) => e.triggers.forEach((t) => set.add(t)));
    draft.triggers.forEach((t) => set.add(t));
    return [...set];
  }, [entries, draft.triggers]);

  const sortedDates = useMemo(() => Object.keys(entries).sort(), [entries]);

  function loadDate(date: string) {
    const e = entries[date];
    setError(null);
    setSaved(false);
    setDraft(
      e ? { ...e } : { date, mood: null, intensity: null, frequency: null, triggers: [], notes: "" },
    );
  }

  function toggleTrigger(t: string) {
    setDraft((d) => ({
      ...d,
      triggers: d.triggers.includes(t) ? d.triggers.filter((x) => x !== t) : [...d.triggers, t],
    }));
  }

  function addCustomTrigger() {
    const val = customTrigger.trim();
    if (!val) return;
    setDraft((d) => (d.triggers.includes(val) ? d : { ...d, triggers: [...d.triggers, val] }));
    setCustomTrigger("");
  }

  function save() {
    if (draft.mood === null) {
      setError("Please select a mood score first.");
      return;
    }
    setError(null);
    start(async () => {
      try {
        const res = await saveMoodEntry({
          date: draft.date,
          mood: draft.mood,
          intensity: draft.intensity ?? 0,
          frequency: draft.frequency ?? 0,
          triggers: draft.triggers,
          notes: draft.notes,
        });
        if (res.ok) {
          setEntries((m) => ({ ...m, [res.entry.date]: res.entry }));
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        } else {
          setError(res.error);
        }
      } catch {
        setError("Could not save your entry right now. Please try again.");
      }
    });
  }

  function remove() {
    if (!entries[draft.date]) return;
    setError(null);
    start(async () => {
      try {
        const res = await deleteMoodEntry(draft.date);
        if (res.ok) {
          setEntries((m) => {
            const next = { ...m };
            delete next[draft.date];
            return next;
          });
          loadDate(draft.date);
        } else {
          setError(res.error);
        }
      } catch {
        setError("Could not delete that entry right now. Please try again.");
      }
    });
  }

  const isExisting = Boolean(entries[draft.date]);

  return (
    <div className="mx-auto max-w-[1000px]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/today"
          aria-label="Back to today"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">Personal tracking tool</p>
          <h1 className="font-display text-3xl text-[var(--color-ink)]">Mood &amp; Anxiety</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-ink-muted)]">
            Log how you felt each day, watch patterns emerge, and spot your triggers. Private to you.
          </p>
          <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
            A self-tracking tool, not a substitute for care. If you feel unsafe,{" "}
            <Link href="/sos" className="underline underline-offset-2 hover:text-[var(--color-ink)]">
              reach the SOS space
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-[var(--color-line)]">
        {([
          { key: "log", label: "Today's entry", Icon: PencilSimple },
          { key: "dashboard", label: "Dashboard", Icon: ChartLineUp },
          { key: "history", label: "History", Icon: Rows },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              color: tab === key ? "var(--color-brand-ink)" : "var(--color-ink-muted)",
              borderColor: tab === key ? "var(--color-brand)" : "transparent",
            }}
          >
            <Icon size={16} weight={tab === key ? "fill" : "regular"} />
            {label}
          </button>
        ))}
      </div>

      {tab === "log" && (
        <LogPanel
          draft={draft}
          setDraft={setDraft}
          today={today}
          triggerList={triggerList}
          toggleTrigger={toggleTrigger}
          customTrigger={customTrigger}
          setCustomTrigger={setCustomTrigger}
          addCustomTrigger={addCustomTrigger}
          onDateChange={loadDate}
          onSave={save}
          onDelete={remove}
          isExisting={isExisting}
          pending={pending}
          saved={saved}
          error={error}
          entries={entries}
        />
      )}

      {tab === "dashboard" && <DashboardPanel entries={entries} sortedDates={sortedDates} />}

      {tab === "history" && (
        <HistoryPanel
          entries={entries}
          sortedDates={sortedDates}
          onEdit={(d) => {
            loadDate(d);
            setTab("log");
          }}
        />
      )}
    </div>
  );
}

/* ── Scale selector ─────────────────────────────────────────── */
function Scale({
  levels,
  value,
  colorFn,
  onPick,
}: {
  levels: { v: number; label: string }[];
  value: number | null;
  colorFn: (v: number) => string;
  onPick: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {levels.map((lv) => {
        const sel = value === lv.v;
        return (
          <button
            key={lv.v}
            type="button"
            onClick={() => onPick(lv.v)}
            className="min-w-[62px] flex-1 rounded-lg border px-1.5 py-2 text-center text-[11px] transition-transform"
            style={{
              background: sel ? colorFn(lv.v) : "#fff",
              borderColor: sel ? "transparent" : "var(--color-line)",
              color: sel ? "#fff" : "var(--color-ink-muted)",
              transform: sel ? "translateY(-2px)" : "none",
              boxShadow: sel ? "0 6px 16px -6px rgba(0,0,0,.35)" : "none",
            }}
          >
            <span className="block text-sm font-bold" style={{ color: sel ? "#fff" : "var(--color-ink)" }}>
              {lv.v}
            </span>
            {lv.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Log panel ──────────────────────────────────────────────── */
function LogPanel({
  draft,
  setDraft,
  today,
  triggerList,
  toggleTrigger,
  customTrigger,
  setCustomTrigger,
  addCustomTrigger,
  onDateChange,
  onSave,
  onDelete,
  isExisting,
  pending,
  saved,
  error,
  entries,
}: {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  today: string;
  triggerList: string[];
  toggleTrigger: (t: string) => void;
  customTrigger: string;
  setCustomTrigger: (s: string) => void;
  addCustomTrigger: () => void;
  onDateChange: (d: string) => void;
  onSave: () => void;
  onDelete: () => void;
  isExisting: boolean;
  pending: boolean;
  saved: boolean;
  error: string | null;
  entries: Record<string, MoodEntry>;
}) {
  const spark = useMemo(() => {
    const dates = Object.keys(entries).sort().slice(-14);
    return dates.map((d) => entries[d].mood);
  }, [entries]);

  const fieldLabel = "mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-muted)]";

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      {/* Entry form */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-xl text-[var(--color-ink)]">Log an entry</h2>
        <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">Pick the date, then rate how you felt.</p>

        <div className="mt-5">
          <label className={fieldLabel}>Date</label>
          <input
            type="date"
            value={draft.date}
            max={today || undefined}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="mt-4">
          <label className={fieldLabel}>Mood (−5 Suicidal → +5 Euphoric)</label>
          <Scale levels={MOOD_LEVELS} value={draft.mood} colorFn={moodColor} onPick={(v) => setDraft((d) => ({ ...d, mood: v }))} />
        </div>

        <div className="mt-4">
          <label className={fieldLabel}>Anxiety intensity (0 None → 5 Dissociation)</label>
          <Scale levels={ANX_LEVELS} value={draft.intensity} colorFn={anxColor} onPick={(v) => setDraft((d) => ({ ...d, intensity: v }))} />
        </div>

        <div className="mt-4">
          <label className={fieldLabel}>Anxiety frequency (0 None → 5 Episodes/day)</label>
          <Scale levels={FREQ_LEVELS} value={draft.frequency} colorFn={anxColor} onPick={(v) => setDraft((d) => ({ ...d, frequency: v }))} />
        </div>

        <div className="mt-4">
          <label className={fieldLabel}>Triggers</label>
          <div className="flex flex-wrap gap-2">
            {triggerList.map((t) => {
              const sel = draft.triggers.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTrigger(t)}
                  className="rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors"
                  style={{
                    background: sel ? "var(--color-brand-ink)" : "#fff",
                    borderColor: sel ? "transparent" : "var(--color-line)",
                    color: sel ? "#fff" : "var(--color-ink-muted)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={customTrigger}
              onChange={(e) => setCustomTrigger(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomTrigger();
                }
              }}
              placeholder="Add a custom trigger…"
              className="flex-1 rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="button"
              onClick={addCustomTrigger}
              className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm font-medium text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className={fieldLabel}>Notes</label>
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="What happened today? Anything you noticed…"
            className="min-h-[64px] w-full resize-y rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={pending}
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-fg)] transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save entry"}
          </button>
          {isExisting && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-lg border border-[var(--color-crisis)]/40 px-4 py-2 text-sm font-medium text-[var(--color-crisis)] transition-colors hover:bg-[var(--color-crisis)]/5 disabled:opacity-60"
            >
              Delete this day
            </button>
          )}
          {saved && <span className="text-sm text-[var(--color-brand-ink)]">Saved</span>}
        </div>
      </div>

      {/* Reference + snapshot */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-xl text-[var(--color-ink)]">Scale reference</h2>
        <div className="mt-3 space-y-3 text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
          <p>
            <strong className="text-[var(--color-ink)]">Mood:</strong> 5 Euphoric · 4 Excited · 3 Very Good · 2 Good · 1 Fair · 0 Neutral · −1 Not good · −2 Sad · −3 Very sad · −4 Melancholic · −5 Suicidal
          </p>
          <p>
            <strong className="text-[var(--color-ink)]">Anxiety intensity:</strong> 0 None · 1 Mild · 2 Moderate · 3 Severe · 4 Extreme · 5 Dissociation
          </p>
          <p>
            <strong className="text-[var(--color-ink)]">Anxiety frequency:</strong> 0 None · 1 Sometimes · 2 Half the time · 3 &gt; half the time · 4 All the time · 5 Episodes/day
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {[
            { l: "Mood", v: draft.mood, c: draft.mood !== null ? moodColor(draft.mood) : "#8a8f82" },
            { l: "Intensity", v: draft.intensity, c: draft.intensity !== null ? anxColor(draft.intensity) : "#8a8f82" },
            { l: "Frequency", v: draft.frequency, c: draft.frequency !== null ? anxColor(draft.frequency) : "#8a8f82" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-[var(--color-line)] bg-white p-3 text-center">
              <div className="font-display text-2xl" style={{ color: s.c }}>{s.v ?? "—"}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-ink-muted)]">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-display text-base text-[var(--color-ink)]">14-day trend</h3>
          <p className="mb-2 text-xs text-[var(--color-ink-muted)]">A quick look — full charts live on the Dashboard tab.</p>
          <Sparkline values={spark} min={MOOD_MIN} max={MOOD_MAX} />
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard panel ────────────────────────────────────────── */
function DashboardPanel({
  entries,
  sortedDates,
}: {
  entries: Record<string, MoodEntry>;
  sortedDates: string[];
}) {
  if (sortedDates.length === 0) {
    return (
      <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-10 text-center text-sm text-[var(--color-ink-muted)]">
        Log a few entries to see your dashboard.
      </div>
    );
  }

  const last7 = sortedDates.slice(-7).map((d) => entries[d]);
  const prev7 = sortedDates.slice(-14, -7).map((d) => entries[d]);
  const moodAvg = avg(last7.map((e) => e.mood));
  const moodPrev = avg(prev7.map((e) => e.mood));
  const intAvg = avg(last7.map((e) => e.intensity));
  const freqAvg = avg(last7.map((e) => e.frequency));
  const delta = moodAvg !== null && moodPrev !== null ? moodAvg - moodPrev : null;

  const moodValues = sortedDates.map((d) => entries[d].mood);
  const intValues = sortedDates.map((d) => entries[d].intensity);
  const freqValues = sortedDates.map((d) => entries[d].frequency);

  const triggerCounts: Record<string, number> = {};
  sortedDates.forEach((d) => entries[d].triggers.forEach((t) => (triggerCounts[t] = (triggerCounts[t] || 0) + 1)));
  const triggerItems = Object.keys(triggerCounts)
    .sort((a, b) => triggerCounts[b] - triggerCounts[a])
    .map((label) => ({ label, value: triggerCounts[label] }));

  const distItems = MOOD_LEVELS.map((l) => ({
    label: String(l.v),
    value: moodValues.filter((v) => v === l.v).length,
    color: moodColor(l.v),
  }));

  const stats = [
    { l: "Entries logged", v: String(sortedDates.length), d: null as string | null },
    {
      l: "7-day avg mood",
      v: moodAvg !== null ? moodAvg.toFixed(1) : "—",
      d: delta !== null ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)} vs prior 7d` : null,
    },
    { l: "7-day avg intensity", v: intAvg !== null ? intAvg.toFixed(1) : "—", d: null },
    { l: "7-day avg frequency", v: freqAvg !== null ? freqAvg.toFixed(1) : "—", d: null },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
            <div className="font-display text-2xl text-[var(--color-ink)]">{s.v}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">{s.l}</div>
            {s.d && (
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: s.d.includes("▲") ? "var(--color-brand-ink)" : "var(--color-crisis)" }}>
                {s.d}
              </div>
            )}
          </div>
        ))}
      </div>

      <ChartCard title="Mood over time" hint="Each point is coloured by that day's mood score.">
        <TrendLine
          labels={sortedDates}
          min={MOOD_MIN}
          max={MOOD_MAX}
          series={[{ values: moodValues, color: "#8a8f82", pointColors: moodValues.map((v) => moodColor(v)), fill: true }]}
        />
      </ChartCard>

      <ChartCard title="Anxiety — intensity & frequency">
        <TrendLine
          labels={sortedDates}
          min={ANX_MIN}
          max={ANX_MAX}
          series={[
            { values: intValues, color: "#b6543f", label: "Intensity" },
            { values: freqValues, color: "#c8963f", label: "Frequency" },
          ]}
        />
        <div className="mt-2 flex justify-center gap-5 text-xs text-[var(--color-ink-muted)]">
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#b6543f" }} /> Intensity</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#c8963f" }} /> Frequency</span>
        </div>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Most common triggers">
          <HBars items={triggerItems} />
        </ChartCard>
        <ChartCard title="Mood distribution">
          <VBars items={distItems} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display text-lg text-[var(--color-ink)]">{title}</h2>
      {hint && <p className="mb-3 text-xs text-[var(--color-ink-muted)]">{hint}</p>}
      <div className={hint ? "" : "mt-3"}>{children}</div>
    </div>
  );
}

/* ── History panel ──────────────────────────────────────────── */
function HistoryPanel({
  entries,
  sortedDates,
  onEdit,
}: {
  entries: Record<string, MoodEntry>;
  sortedDates: string[];
  onEdit: (d: string) => void;
}) {
  const rows = [...sortedDates].reverse();
  return (
    <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <h2 className="font-display text-xl text-[var(--color-ink)]">All entries</h2>
      <p className="mb-3 text-sm text-[var(--color-ink-muted)]">Select a row to open it for editing.</p>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-ink-muted)]">No entries yet — log your first day.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-ink-muted)]">
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Date</th>
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Mood</th>
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Intensity</th>
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Frequency</th>
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Triggers</th>
                <th className="border-b border-[var(--color-line)] px-2.5 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const e = entries[d];
                return (
                  <tr
                    key={d}
                    onClick={() => onEdit(d)}
                    className="cursor-pointer transition-colors hover:bg-[var(--color-surface-sunken)]"
                  >
                    <td className="border-b border-[var(--color-line)] px-2.5 py-2 text-[var(--color-ink)]">{d}</td>
                    <td className="border-b border-[var(--color-line)] px-2.5 py-2"><Pill value={e.mood} color={moodColor(e.mood)} title={moodLabel(e.mood)} /></td>
                    <td className="border-b border-[var(--color-line)] px-2.5 py-2"><Pill value={e.intensity} color={anxColor(e.intensity)} /></td>
                    <td className="border-b border-[var(--color-line)] px-2.5 py-2"><Pill value={e.frequency} color={anxColor(e.frequency)} /></td>
                    <td className="border-b border-[var(--color-line)] px-2.5 py-2">
                      <div className="flex flex-wrap gap-1">
                        {e.triggers.map((t) => (
                          <span key={t} className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] text-[var(--color-brand-ink)]">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[220px] border-b border-[var(--color-line)] px-2.5 py-2 text-[12px] text-[var(--color-ink-muted)]">{e.notes.slice(0, 80)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Pill({ value, color, title }: { value: number; color: string; title?: string }) {
  return (
    <span
      title={title}
      className="inline-block min-w-[22px] rounded-full px-2 py-0.5 text-center text-[11px] font-bold text-white"
      style={{ background: color }}
    >
      {value}
    </span>
  );
}
