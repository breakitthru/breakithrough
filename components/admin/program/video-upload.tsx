"use client";

import { useRef, useState } from "react";
import { UploadSimple, CheckCircle, Spinner } from "@phosphor-icons/react";
import { startVideoUpload } from "@/lib/admin-program-actions";

/*
  Seamless clip upload. Picks a file, asks the server for a one-time Cloudflare
  Stream upload URL, then uploads the bytes straight to Cloudflare from the
  browser (with progress) and hands the resulting `uid` back to the form.
*/

function putFile(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  });
}

export function VideoUpload({
  value,
  onChange,
  configured,
}: {
  value: string;
  onChange: (uid: string) => void;
  configured: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading">("idle");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("That doesn't look like a video file.");
      return;
    }
    setState("uploading");
    setPct(0);
    setError(null);
    try {
      const ticket = await startVideoUpload(file.name);
      if (!ticket.ok) {
        setError(ticket.error);
        setState("idle");
        return;
      }
      await putFile(ticket.uploadURL, file, setPct);
      onChange(ticket.uid);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setState("idle");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={onFile} />

      {state === "uploading" ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-line)] p-3">
          <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <Spinner size={16} className="animate-spin" /> Uploading… {pct}%
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)]">
            <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : value ? (
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-line)] px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-[var(--color-success)]">
            <CheckCircle size={18} weight="fill" /> Video attached
          </span>
          <button type="button" onClick={pick} className="text-[var(--color-ink-muted)] underline-offset-2 hover:underline" disabled={!configured}>
            Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={!configured}
          className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] px-3 py-4 text-sm text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadSimple size={18} /> Upload a video file
        </button>
      )}

      {!configured && (
        <p className="text-xs text-[var(--color-ink-faint)]">
          Video hosting isn&apos;t connected yet. Once Cloudflare Stream is set up, uploads work here directly.
        </p>
      )}
      {error && <p className="text-sm text-[var(--color-crisis)]">{error}</p>}
    </div>
  );
}
