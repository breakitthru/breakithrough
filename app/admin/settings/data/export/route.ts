import { requireOwner } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

/*
  Owner-only database export. Respects the privacy wall: member reflection and
  chat bodies (and raw intake answers) are NEVER included in any export. The full
  backup bundles operational tables only.
*/

export const dynamic = "force-dynamic";

// Safe, non-sensitive member columns (no password, intake, reflections or chat).
const memberSelect = {
  id: true,
  email: true,
  name: true,
  displayName: true,
  role: true,
  staffRole: true,
  plan: true,
  programStartDate: true,
  trialStartedAt: true,
  paidAt: true,
  completedAt: true,
  pointsBalance: true,
  streakCurrent: true,
  streakLongest: true,
  lastCompletedDay: true,
  deletedAt: true,
  createdAt: true,
} as const;

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = v instanceof Date ? v.toISOString() : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}

function file(body: string, name: string, contentType: string) {
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}

export async function GET(req: Request) {
  const admin = await requireOwner();
  const type = new URL(req.url).searchParams.get("type") ?? "backup";
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "members") {
    const rows = await prisma.user.findMany({ select: memberSelect, orderBy: { createdAt: "desc" } });
    await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "data.export", targetType: "User", summary: `Exported ${rows.length} members (CSV)` });
    return file(toCsv(rows as Record<string, unknown>[]), `members-${stamp}.csv`, "text/csv; charset=utf-8");
  }

  if (type === "payments") {
    const rows = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "data.export", targetType: "Payment", summary: `Exported ${rows.length} payments (CSV)` });
    return file(toCsv(rows as unknown as Record<string, unknown>[]), `payments-${stamp}.csv`, "text/csv; charset=utf-8");
  }

  // Full operational backup (JSON) — no private bodies.
  const [users, payments, pointsLedger, redemptions, rewards, badges, userBadges, phases, days, tasks, videos, helplines, siteConfig, auditLog] =
    await Promise.all([
      prisma.user.findMany({ select: memberSelect }),
      prisma.payment.findMany(),
      prisma.pointsLedger.findMany(),
      prisma.redemption.findMany(),
      prisma.reward.findMany(),
      prisma.badge.findMany(),
      prisma.userBadge.findMany(),
      prisma.phase.findMany(),
      prisma.day.findMany(),
      prisma.task.findMany(),
      prisma.video.findMany(),
      prisma.helpline.findMany(),
      prisma.siteConfig.findMany(),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10000 }),
    ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    note: "Operational backup. Member reflections, chat messages and raw intake answers are intentionally excluded for privacy.",
    users,
    payments,
    pointsLedger,
    redemptions,
    rewards,
    badges,
    userBadges,
    phases,
    days,
    tasks,
    videos,
    helplines,
    siteConfig,
    auditLog,
  };

  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "data.export", summary: "Exported full operational backup (JSON)" });
  return file(JSON.stringify(backup, null, 2), `break-it-thru-backup-${stamp}.json`, "application/json");
}
