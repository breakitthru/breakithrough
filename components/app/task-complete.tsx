"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completeTask } from "@/lib/actions";

export function TaskComplete({
  taskId,
  dayNumber,
  points,
  responseType,
  completed,
}: {
  taskId: string;
  dayNumber: number;
  points: number;
  responseType: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (completed) {
    return (
      <div className="sticky bottom-24 mt-10 flex items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-success-subtle)] py-4 font-medium text-[var(--color-success)] lg:bottom-6">
        <CheckCircle size={20} weight="fill" /> Done — nice work
      </div>
    );
  }

  async function mark() {
    setBusy(true);
    setError("");
    const res = await completeTask(taskId, responseType === "WRITTEN" ? response : undefined);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong");
      return;
    }
    // Earning a badge takes you to its celebration; otherwise back to the day.
    if (res.newBadges && res.newBadges.length > 0) {
      router.push(`/progress/badges/${res.newBadges[0]}`);
    } else {
      router.push(`/journey/day/${dayNumber}`);
    }
    router.refresh();
  }

  return (
    <div>
      {responseType === "WRITTEN" && (
        <Card className="mt-6 p-4">
          <label className="eyebrow">A few words (optional)</label>
          <textarea
            rows={4}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write anything…"
            className="mt-2 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-sunken)] p-3 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </Card>
      )}
      {error && (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-crisis-subtle)] px-4 py-2.5 text-sm text-[var(--color-crisis)]">
          {error}
        </p>
      )}
      <div className="sticky bottom-24 mt-8 lg:bottom-6">
        <Button variant="primary" size="lg" className="w-full" onClick={mark} disabled={busy}>
          {busy ? "Saving…" : `Mark complete · +${points}`}
        </Button>
      </div>
    </div>
  );
}
