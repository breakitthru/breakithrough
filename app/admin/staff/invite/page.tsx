import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requirePermission } from "@/lib/admin";
import { PageHeader } from "@/components/admin/ui";
import { InviteForm } from "@/components/admin/staff/invite-form";

export default async function InviteStaffPage() {
  await requirePermission("staff.manage");
  return (
    <>
      <Link href="/admin/staff" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> Staff
      </Link>
      <PageHeader eyebrow="Workspace" title="Invite staff" subtitle="Create an invite, share the link, they enrol 2FA on first sign-in." />
      <InviteForm />
    </>
  );
}
