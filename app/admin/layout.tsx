import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { requireStaffRaw } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

/*
  Admin shell. Identity + role are gated here (requireStaffRaw); 2FA is enforced
  per page (requireStaff/requirePermission) so the /admin/security pages stay
  reachable during enrollment. Separate route group from the member (app) shell.
*/
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffRaw();
  const name = user.displayName ?? user.name ?? user.email ?? "Owner";

  let alerts = 0;
  try {
    const [sos, failed, redemptions] = await Promise.all([
      prisma.sosEvent.count({ where: { reviewedAt: null } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.redemption.count({ where: { status: "REQUESTED" } }),
    ]);
    alerts = sos + failed + redemptions;
  } catch {
    alerts = 0;
  }

  return (
    <div className="min-h-dvh bg-[var(--color-canvas)]">
      <AdminSidebar
        role={user.effectiveRole}
        displayName={name}
        avatarInitial={name.charAt(0).toUpperCase()}
      />
      <div className="ml-[248px] flex min-h-dvh flex-col">
        <AdminTopbar alerts={alerts} />
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
