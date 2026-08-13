"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Sparkle, PaperPlaneRight, LockSimple, ArrowLeft } from "@phosphor-icons/react";
import { Chip } from "@/components/ui/card";
import { sendDaylightMessage } from "@/lib/daylight-actions";

export type ChatMsg = { role: "USER" | "ASSISTANT"; content: string };

const OPENERS = ["I can't sleep", "I nearly texted him", "Just checking in"];

export function DaylightChat({ history, configured }: { history: ChatMsg[]; configured: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>(history);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "USER", content: trimmed }]);
    start(async () => {
      const res = await sendDaylightMessage(trimmed);
      if (res.ok) {
        setMessages((m) => [...m, { role: "ASSISTANT", content: res.reply }]);
      } else {
        setError(res.error);
      }
    });
  };

  const empty = messages.length === 0;

  return (
    <div className="daylight-reveal mx-auto flex h-[calc(100dvh-5rem)] max-w-[820px] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--color-line)] pb-4">
        <Link href="/today" aria-label="Back to your dashboard" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]">
          <ArrowLeft size={18} />
        </Link>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-brand-ink)] text-white">
          <Sparkle size={22} weight="fill" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl text-[var(--color-ink)]">Daylight</h1>
            <Chip tone="brand">AI</Chip>
          </div>
          <p className="text-sm text-[var(--color-ink-muted)]">AI companion · always awake</p>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 py-4 text-center text-xs text-[var(--color-ink-faint)]">
        <LockSimple size={13} /> Private to you · AI, not a person ·{" "}
        <Link href="/sos" className="underline underline-offset-2 hover:text-[var(--color-ink)]">SOS if unsafe</Link>
      </p>

      {/* Messages */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-1">
        {empty && (
          <div className="flex flex-1 flex-col justify-center">
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-[var(--radius-lg)] rounded-bl-sm border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)]">
                <p>I&rsquo;m Daylight. Not a person — but I&rsquo;m awake whenever you are.</p>
                <p className="mt-3">Start anywhere: how today went, or whatever&rsquo;s sitting on your chest.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {OPENERS.map((o) => (
                <button
                  key={o}
                  onClick={() => send(o)}
                  disabled={!configured || pending}
                  className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "USER" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "USER"
                  ? "max-w-[75%] whitespace-pre-wrap rounded-[var(--radius-lg)] rounded-br-sm bg-[var(--color-brand-ink)] px-4 py-3 text-white"
                  : "max-w-[75%] whitespace-pre-wrap rounded-[var(--radius-lg)] rounded-bl-sm border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)]"
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="flex justify-start">
            <div className="rounded-[var(--radius-lg)] rounded-bl-sm border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink-faint)]">
              Daylight is typing…
            </div>
          </div>
        )}
      </div>

      {error && <p className="px-1 pt-2 text-center text-sm text-[var(--color-crisis)]">{error}</p>}

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-4 flex items-center gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!configured || pending}
          placeholder={configured ? "Type anything…" : "Daylight is coming online soon…"}
          className="h-12 flex-1 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={!configured || pending || !input.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] disabled:opacity-60"
          aria-label="Send"
        >
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </form>
    </div>
  );
}
