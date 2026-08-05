"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";

export function MemberFilters({ q, plan }: { q: string; plan: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  const apply = (next: { q?: string; plan?: string }) => {
    const params = new URLSearchParams();
    const qv = next.q ?? query;
    const pv = next.plan ?? plan;
    if (qv) params.set("q", qv);
    if (pv) params.set("plan", pv);
    router.push(`/admin/members${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => { e.preventDefault(); apply({}); }}
        className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2"
      >
        <MagnifyingGlass size={16} className="text-[var(--color-ink-faint)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          className="w-56 bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
        />
      </form>
      <select
        value={plan}
        onChange={(e) => apply({ plan: e.target.value })}
        className="rounded-[var(--radius-pill)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2 text-sm text-[var(--color-ink)] outline-none"
      >
        <option value="">All plans</option>
        <option value="TRIAL">Trial</option>
        <option value="ACTIVE">Active</option>
        <option value="EXPIRED">Expired</option>
        <option value="COMPLETED">Completed</option>
      </select>
    </div>
  );
}
