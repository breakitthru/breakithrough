import Link from "next/link";
import { EmptyState } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        title="That record is gone."
        body="The page you're after doesn't exist or was moved."
        action={
          <Link href="/admin" className="rounded-[var(--radius-pill)] bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-[var(--color-brand-fg)] hover:bg-[var(--color-brand-hover)]">
            Back to overview
          </Link>
        }
      />
    </div>
  );
}
