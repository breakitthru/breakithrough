import Link from "next/link";
import { DownloadSimple, Table, FileJs } from "@phosphor-icons/react/dist/ssr";
import { requireOwner } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { SettingsTabs } from "@/components/admin/settings/settings-tabs";

const linkClass =
  "flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface)]";

export default async function DataExportPage() {
  await requireOwner();

  return (
    <>
      <PageHeader eyebrow="Settings" title="Data export" subtitle="Download your data for backups or handoff. Each export is recorded in the audit log." />
      <SettingsTabs />

      <Card className="max-w-xl p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="font-semibold text-[var(--color-ink)]">Members</p>
            <p className="mb-2 text-sm text-[var(--color-ink-muted)]">Every member with their plan, points and streak. No private reflections.</p>
            <Link href="/admin/settings/data/export?type=members" prefetch={false} className={linkClass}>
              <Table size={16} /> Members (CSV)
            </Link>
          </div>

          <div className="border-t border-[var(--color-line)] pt-5">
            <p className="font-semibold text-[var(--color-ink)]">Payments</p>
            <p className="mb-2 text-sm text-[var(--color-ink-muted)]">All payment records with Razorpay order and payment ids.</p>
            <Link href="/admin/settings/data/export?type=payments" prefetch={false} className={linkClass}>
              <Table size={16} /> Payments (CSV)
            </Link>
          </div>

          <div className="border-t border-[var(--color-line)] pt-5">
            <p className="font-semibold text-[var(--color-ink)]">Full backup</p>
            <p className="mb-2 text-sm text-[var(--color-ink-muted)]">
              A single JSON file with all operational data (members, payments, program, rewards, points, audit and settings).
            </p>
            <Link href="/admin/settings/data/export?type=backup" prefetch={false} className={linkClass}>
              <FileJs size={16} /> Full backup (JSON)
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-subtle)] p-4 text-sm text-[var(--color-brand-subtle-ink)]">
          <DownloadSimple size={18} weight="fill" className="mt-0.5 shrink-0" />
          <span>
            For members&rsquo; privacy, reflections, chat messages and raw intake answers are never included in any export.
          </span>
        </div>
      </Card>
    </>
  );
}
