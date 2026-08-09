"use client";

/*
  Simple localStorage cart for the money shop. Prices here are for display only;
  the server always re-prices from the database at checkout. The same item in two
  sizes is two separate lines (keyed by id + size). Components listen for the
  "bit-cart-changed" event to stay in sync.
*/

export type CartEntry = { id: string; size?: string | null; title: string; priceInr: number; quantity: number; imageUrl?: string | null };

const KEY = "bit-cart";
const EVENT = "bit-cart-changed";

/** Stable key for a cart line (item + chosen size). */
export function lineKey(e: { id: string; size?: string | null }): string {
  return `${e.id}__${e.size ?? ""}`;
}

export function getCart(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartEntry[]) : [];
  } catch {
    return [];
  }
}

function save(cart: CartEntry[]) {
  window.localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(item: Omit<CartEntry, "quantity">, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((c) => lineKey(c) === lineKey(item));
  if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
  else cart.push({ ...item, quantity: Math.min(20, quantity) });
  save(cart);
}

export function setQty(key: string, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) cart = cart.filter((c) => lineKey(c) !== key);
  else cart = cart.map((c) => (lineKey(c) === key ? { ...c, quantity: Math.min(20, quantity) } : c));
  save(cart);
}

export function removeFromCart(key: string) {
  save(getCart().filter((c) => lineKey(c) !== key));
}

export function clearCart() {
  save([]);
}

export function cartCount(cart: CartEntry[]): number {
  return cart.reduce((n, c) => n + c.quantity, 0);
}

export const CART_EVENT = EVENT;
