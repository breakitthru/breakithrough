import {
  Footprints,
  PenNib,
  Sun,
  Plant,
  CheckCircle,
  Drop,
  HandHeart,
  CalendarCheck,
  Mountains,
  Trophy,
  Tree,
  Sparkle,
  Lock,
} from "@phosphor-icons/react/dist/ssr";

// Each badge gets its own icon so the wall reads as a varied collection, not a
// row of identical medals. Keyed by the seeded badge key (badge-1 … badge-12).
const ICONS: Record<string, React.ComponentType<{ size?: number; weight?: "fill" }>> = {
  "badge-1": Footprints,
  "badge-2": PenNib,
  "badge-3": Sun,
  "badge-4": Plant,
  "badge-5": CheckCircle,
  "badge-6": Drop,
  "badge-7": HandHeart,
  "badge-8": CalendarCheck,
  "badge-9": Mountains,
  "badge-10": Trophy,
  "badge-11": Tree,
  "badge-12": Sparkle,
};

/** Circular badge icon. Earned badges alternate evergreen/clay tints; locked
 *  badges are a muted lock. `index` drives the alternating tint. */
export function BadgeIcon({
  badgeKey,
  earned,
  index = 0,
  size = 64,
  iconSize = 26,
}: {
  badgeKey: string;
  earned: boolean;
  index?: number;
  size?: number;
  iconSize?: number;
}) {
  const Icon = ICONS[badgeKey] ?? Sparkle;
  const style = { width: size, height: size };

  if (!earned) {
    return (
      <span
        style={style}
        className="flex items-center justify-center rounded-full border-2 border-[var(--color-line-strong)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-faint)]"
      >
        <Lock size={iconSize - 4} />
      </span>
    );
  }

  const clay = index % 2 === 1;
  return (
    <span
      style={style}
      className={`flex items-center justify-center rounded-full ${
        clay
          ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]"
          : "bg-[var(--color-brand-subtle)] text-[var(--color-brand)]"
      }`}
    >
      <Icon size={iconSize} weight="fill" />
    </span>
  );
}
