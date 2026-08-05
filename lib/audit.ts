import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/*
  Append-only audit trail. Every admin mutation calls this. Never throws into
  the caller — a failed audit write must not break the action, but it is logged.
*/
export async function logAudit(input: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  summary: string;
  meta?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        summary: input.summary,
        meta: input.meta,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write entry", input.action, err);
  }
}
