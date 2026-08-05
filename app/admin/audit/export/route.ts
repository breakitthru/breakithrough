import { requirePermission } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// CSV export of the audit log. Per spec, exporting DOES write an audit entry.
export async function GET() {
  const admin = await requirePermission("audit.view");
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });

  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["createdAt", "actorEmail", "action", "targetType", "targetId", "summary"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.createdAt.toISOString(),
      r.actorEmail ?? "",
      r.action,
      r.targetType ?? "",
      r.targetId ?? "",
      r.summary,
    ].map((v) => esc(String(v))).join(","));
  }

  await logAudit({ actorId: admin.id, actorEmail: admin.email, action: "audit.export", summary: `Exported ${rows.length} audit entries` });

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
