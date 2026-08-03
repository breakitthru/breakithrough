import Link from "next/link";

// Account deleted (D88) — standalone, no app shell (the account no longer exists).
export default function AccountDeletedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-canvas)] px-6 text-center">
      <h1 className="font-display text-[2.75rem] leading-tight text-[var(--color-ink)]">
        Your account is deleted.
      </h1>
      <p className="mt-3 max-w-md text-[var(--color-ink-muted)]">
        Your space is gone, as you asked. Thank you for spending some of these days with us — we hope
        they helped. You&rsquo;re always welcome back.
      </p>
      <p className="mt-8 text-sm text-[var(--color-ink-faint)]">
        Need help in a hard moment? SOS and helplines are always free at{" "}
        <Link href="/sos" className="underline">
          /sos
        </Link>
        .
      </p>
    </div>
  );
}
