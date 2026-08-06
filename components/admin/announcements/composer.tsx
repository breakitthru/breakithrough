"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/admin/drawer";
import { sendNotification } from "@/lib/admin-notify-actions";

const AUDIENCES = [
  { value: "all", label: "All members" },
  { value: "active", label: "Active members (started the program)" },
  { value: "single", label: "One member (by email)" },
] as const;

const TYPES = [
  { value: "system", label: "System" },
  { value: "reminder", label: "Reminder" },
  { value: "reward", label: "Reward" },
  { value: "badge", label: "Badge" },
] as const;

export function AnnouncementComposer() {
  const router = useRouter();
  const [audience, setAudience] = useState("all");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("system");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setError(null);
      setSentCount(null);
      const res = await sendNotification({ audience, email, type, title, body, actionUrl });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSentCount(res.count);
      setTitle("");
      setBody("");
      setActionUrl("");
      router.refresh();
    });

  return (
    <Card className="max-w-xl p-6">
      <Field label="Send to">
        <select className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value)}>
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </Field>

      {audience === "single" && (
        <Field label="Member email">
          <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>
      )}

      <Field label="Kind">
        <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short headline members see" maxLength={120} />
      </Field>

      <Field label="Message (optional)">
        <textarea className={inputClass} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="A line or two of detail." maxLength={500} />
      </Field>

      <Field label="Link (optional)">
        <input className={inputClass} value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="/progress/rewards" />
      </Field>

      {error && <p className="mb-3 text-sm text-[var(--color-crisis)]">{error}</p>}

      <Button size="sm" variant="primary" onClick={submit} disabled={pending || !title.trim()}>
        {pending ? "Sending…" : "Send notification"}
      </Button>

      {sentCount !== null && !pending && (
        <p className="mt-3 text-sm text-[var(--color-success)]">
          Sent to {sentCount} {sentCount === 1 ? "member" : "members"}.
        </p>
      )}
    </Card>
  );
}
