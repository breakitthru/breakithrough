import { prisma } from "@/lib/prisma";
import { getProgramState } from "@/lib/program";
import { BADGE_DEFS, type BadgeCriteria } from "@/lib/badge-defs";

/*
  Badge awarding. Criteria (in lib/badge-defs.ts) are checked against the user's
  real stats; badges are never revoked. Names/criteria are seeded into the DB so
  the admin panel can eventually edit them.
*/

/** Check the user's stats and award any newly-earned badges. Safe to call often. */
export async function awardBadges(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const [tasks, reflections, state, badgeRows, already] = await Promise.all([
    prisma.taskCompletion.count({ where: { userId } }),
    prisma.reflection.count({ where: { userId } }),
    getProgramState(user),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);

  const earnedIds = new Set(already.map((a) => a.badgeId));
  const byKey = new Map(badgeRows.map((b) => [b.key, b]));
  const stats: Record<BadgeCriteria["type"], number> = {
    tasks,
    reflections,
    days: user.streakCurrent,
    full_days: state.completed.size,
    day_reached: state.unlockedDay,
  };

  for (const def of BADGE_DEFS) {
    const badge = byKey.get(def.key);
    if (!badge || earnedIds.has(badge.id)) continue;
    if (stats[def.criteria.type] >= def.criteria.n) {
      await prisma.userBadge
        .create({ data: { userId, badgeId: badge.id } })
        .catch(() => {}); // ignore race duplicates
    }
  }
}
