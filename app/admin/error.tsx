"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/*
  Route-level error boundary for the admin panel. Any uncaught render error
  inside /admin lands here as a recoverable card instead of the raw Next.js
  "client-side exception" overlay. `reset()` re-renders the segment.
*/
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl text-[var(--color-ink)]">
        This admin page hit a snag
      </h1>
      <p className="mt-3 text-[var(--color-ink-muted)]">
        Something went wrong loading this section. Try again, or head back to the
        admin overview.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/admin"
          className="rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Admin overview
        </Link>
      </div>
    </div>
  );
}
