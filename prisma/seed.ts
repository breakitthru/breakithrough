/*
  Seed script — populates a fresh database with baseline, admin-editable data:
  site config, the 4 phases + 60 days, helplines, rewards and badges.

  Idempotent (upserts), so it is safe to run more than once. Run manually with:
    npm run db:seed
  It is intentionally NOT part of the build/deploy — seeding on every deploy
  would clobber admin edits.

  Content is placeholder ("Task 1", "Video 1", generic badges) — real content
  is authored later through the admin panel.
*/

import { PrismaClient } from "@prisma/client";
import { CONFIG_DEFAULTS, PHASES } from "../lib/config";

const prisma = new PrismaClient();

const HELPLINES = [
  { name: "KIRAN", phone: "1800-599-0019", hours: "24×7", languages: "13 languages", order: 1 },
  { name: "Tele-MANAS", phone: "14416", hours: "24×7", languages: "20+ languages", order: 2 },
  { name: "iCall", phone: "9152987821", hours: "Mon–Sat, 8am–10pm", languages: "English, Hindi", order: 3 },
  { name: "Vandrevala Foundation", phone: "1860-2662-345", hours: "24×7", languages: "Multiple", order: 4 },
  { name: "Women Helpline", phone: "181", hours: "24×7", languages: "Multiple", order: 5 },
  { name: "Emergency", phone: "112", hours: "24×7", languages: "—", order: 6 },
];

const REWARDS = [
  { key: "sleep-stories", title: "Guided sleep-story series", description: "A calming audio series for the hard nights.", pointsCost: 30, kind: "DIGITAL" as const, featured: true, order: 1 },
  { key: "recovery-journal", title: "Recovery journal (PDF)", description: "A printable companion journal.", pointsCost: 20, kind: "DIGITAL" as const, featured: false, order: 2 },
  { key: "merch-discount", title: "10% off the merch store", description: "A little off anything in the store.", pointsCost: 25, kind: "DISCOUNT" as const, featured: false, order: 3 },
  { key: "session-discount", title: "25% off a 1:1 session", description: "Use it with any specialist you book.", pointsCost: 80, kind: "DISCOUNT" as const, featured: false, order: 4 },
  { key: "care-package", title: "Care package", description: "A physical kit, posted to you.", pointsCost: 150, kind: "PHYSICAL" as const, featured: false, order: 5 },
];

async function main() {
  // ── Site config (one row per tunable) ──
  for (const [key, value] of Object.entries(CONFIG_DEFAULTS)) {
    await prisma.siteConfig.upsert({
      where: { key },
      update: {},
      create: { key, value: value as never },
    });
  }

  // ── Phases + their days (placeholder tasks/videos come later) ──
  for (const phase of PHASES) {
    const created = await prisma.phase.upsert({
      where: { order: phase.order },
      update: { name: phase.name, dayStart: phase.dayStart, dayEnd: phase.dayEnd },
      create: { order: phase.order, name: phase.name, dayStart: phase.dayStart, dayEnd: phase.dayEnd },
    });
    for (let d: number = phase.dayStart; d <= phase.dayEnd; d++) {
      await prisma.day.upsert({
        where: { dayNumber: d },
        update: { phaseId: created.id },
        create: { dayNumber: d, phaseId: created.id, title: `Day ${d}`, isMilestone: d === CONFIG_DEFAULTS.programDays },
      });
    }
  }

  // ── Helplines ──
  for (const h of HELPLINES) {
    const existing = await prisma.helpline.findFirst({ where: { name: h.name } });
    if (existing) await prisma.helpline.update({ where: { id: existing.id }, data: h });
    else await prisma.helpline.create({ data: h });
  }

  // ── Rewards ──
  for (const r of REWARDS) {
    await prisma.reward.upsert({ where: { key: r.key }, update: r, create: r });
  }

  // ── Badges (12 placeholder) ──
  for (let i = 1; i <= 12; i++) {
    const key = `badge-${i}`;
    await prisma.badge.upsert({
      where: { key },
      update: {},
      create: { key, name: `Badge ${i}`, description: "Placeholder badge description.", order: i },
    });
  }

  console.log("Seed complete: config, phases + days, helplines, rewards, badges.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
