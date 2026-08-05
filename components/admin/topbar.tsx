"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MagnifyingGlass, Bell, CaretDown, SignOut } from "@phosphor-icons/react";

const LABELS: Record<string, string> = {
  admin: "Overview",
  program: "Program",
  videos: "Video library",
  phases: "Phases & badges",
  rules: "Rules",
  intake: "Intake",
  day: "Day",
  members: "Members",
  safety: "Safety",
  "on-call": "On-call & escalation",
  event: "Event",
  money: "Money",
  purchases: "Purchases",
  failed: "Failed payments",
  points: "Points economy",
  rewards: "Rewards",
  staff: "Staff & roles",
  invite: "Invite staff",
  settings: "Settings",
  audit: "Audit log",
  security: "Security",
};

function crumbs(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean); // ["admin", ...]
  const out: string[] = ["Overview"];
  for (const p of parts.slice(1)) {
    out.push(LABELS[p] ?? (/^\d+$/.test(p) ? `#${p}` : p));
  }
  return out;
}

export function AdminTopbar({ alerts = 0 }: { alerts?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const trail = crumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/95 px-8 py-3 backdrop-blur">
      <nav className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-ink-muted)]">
        {trail.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[var(--color-ink-faint)]">/</span>}
            <span className={i === trail.length - 1 ? "text-[var(--color-ink)]" : ""}>{c}</span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) router.push(`/admin/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="hidden items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2 md:flex"
        >
          <MagnifyingGlass size={16} className="text-[var(--color-ink-faint)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members, days, staff…"
            className="w-64 bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
          />
        </form>

        <button
          onClick={() => router.push("/admin/search")}
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"
        >
          <Bell size={20} />
          {alerts > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[0.6rem] font-semibold text-[var(--color-accent-fg)]">
              {alerts > 9 ? "9+" : alerts}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            className="flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2 py-1.5 text-sm text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)]"
          >
            Account <CaretDown size={14} />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-[var(--color-crisis)] hover:bg-[var(--color-surface-sunken)]"
                >
                  <SignOut size={16} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
