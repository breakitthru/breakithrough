/*
  Static catalog content — the same for every user (helplines, rewards, badge
  definitions). Seeded into the DB too; kept here as the read source for now
  until the admin panel manages them. Not user-specific.
*/

export const helplines = [
  { name: "KIRAN", phone: "1800-599-0019", hours: "24×7", languages: "13 languages" },
  { name: "Tele-MANAS", phone: "14416", hours: "24×7", languages: "20+ languages" },
  { name: "iCall", phone: "9152987821", hours: "Mon–Sat, 8am–10pm", languages: "English, Hindi" },
  { name: "Vandrevala Foundation", phone: "1860-2662-345", hours: "24×7", languages: "Multiple" },
  { name: "Women Helpline", phone: "181", hours: "24×7", languages: "Multiple" },
  { name: "Emergency", phone: "112", hours: "24×7", languages: "—" },
];

export const rewards = [
  {
    id: "r1",
    key: "sleep-stories",
    title: "Guided sleep-story series",
    description: "A calming audio series for the hard nights.",
    pointsCost: 30,
    kind: "DIGITAL" as const,
    featured: true,
  },
  {
    id: "r2",
    key: "recovery-journal",
    title: "Recovery journal (PDF)",
    description: "A printable companion journal.",
    pointsCost: 20,
    kind: "DIGITAL" as const,
    featured: false,
  },
  {
    id: "r3",
    key: "merch-discount",
    title: "10% off the merch store",
    description: "A little off anything in the store.",
    pointsCost: 25,
    kind: "DISCOUNT" as const,
    featured: false,
  },
  {
    id: "r4",
    key: "session-discount",
    title: "25% off a 1:1 session",
    description: "Use it with any specialist you book.",
    pointsCost: 80,
    kind: "DISCOUNT" as const,
    featured: false,
  },
  {
    id: "r5",
    key: "care-package",
    title: "Care package",
    description: "A physical kit, posted to you.",
    pointsCost: 150,
    kind: "PHYSICAL" as const,
    featured: false,
  },
];

export const badges = Array.from({ length: 12 }, (_, i) => ({
  id: `b${i + 1}`,
  key: `badge-${i + 1}`,
  name: `Badge ${i + 1}`,
  description: "Placeholder badge description.",
}));
