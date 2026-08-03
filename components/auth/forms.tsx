"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

const inputCls =
  "mt-2 h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]";

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input className={inputCls} {...props} />
    </label>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <p className="rounded-[var(--radius-md)] bg-[var(--color-crisis-subtle)] px-4 py-2.5 text-sm text-[var(--color-crisis)]">
      {text}
    </p>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/today" })}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-sunken)]"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] ring-1 ring-[var(--color-line)]">
        G
      </span>
      {label}
    </button>
  );
}

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setError("Wrong email or password.");
    else router.push("/today");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorNote text={error} />}
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Log in"}
      </Button>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 py-1 text-sm text-[var(--color-ink-faint)]">
            <span className="h-px flex-1 bg-[var(--color-line)]" /> or <span className="h-px flex-1 bg-[var(--color-line)]" />
          </div>
          <GoogleButton />
        </>
      )}
    </form>
  );
}

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not create your account.");
      return;
    }
    // Auto sign in, then head into onboarding.
    const s = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (s?.error) router.push("/login");
    else router.push("/welcome/intake/1");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorNote text={error} />}
      <Field label="First name" autoComplete="given-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Aanya" />
      <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
      <Field label="Password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Creating your account…" : "Create my account"}
      </Button>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 py-1 text-sm text-[var(--color-ink-faint)]">
            <span className="h-px flex-1 bg-[var(--color-line)]" /> or <span className="h-px flex-1 bg-[var(--color-line)]" />
          </div>
          <GoogleButton label="Sign up with Google" />
        </>
      )}
    </form>
  );
}
