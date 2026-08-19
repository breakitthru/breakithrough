/*
  Stock helpers for the shop. Two tracking modes:
   - simple items use the integer `stock` (null = unlimited), and
   - sized items use `sizeStock`, a JSON map { "S": 5, "M": 0 } (null = untracked).
  Shared by checkout validation, the paid-order decrement, and the storefront UI.
*/

type StockItem = { stock: number | null; hasSizes: boolean; sizeStock: unknown };

/** Coerce the JSON sizeStock into a clean { size: count } map, or null if untracked. */
export function sizeStockMap(item: { sizeStock: unknown }): Record<string, number> | null {
  const v = item.sizeStock;
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, number> = {};
  for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
    if (typeof n === "number" && Number.isFinite(n)) out[k] = Math.max(0, Math.floor(n));
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** Available units for an item (and size). null = untracked / unlimited. */
export function availableStock(item: StockItem, size?: string | null): number | null {
  if (item.hasSizes) {
    const map = sizeStockMap(item);
    if (!map) return null; // per-size stock not being tracked
    if (!size) return null;
    return map[size] ?? 0;
  }
  return item.stock; // null = unlimited
}

/** Whether an item is entirely sold out (all tracked stock at zero). */
export function isSoldOut(item: StockItem): boolean {
  if (item.hasSizes) {
    const map = sizeStockMap(item);
    if (!map) return false; // untracked -> treat as available
    return Object.values(map).every((n) => n <= 0);
  }
  return item.stock !== null && item.stock <= 0;
}
