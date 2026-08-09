"use client";

/*
  Simple localStorage cart for the money shop. Prices here are for display only;
  the server always re-prices from the database at checkout. Components listen for
  the "bit-cart-changed" event to stay in sync.
*/

export type CartEntry = { id: string; title: string; priceInr: number; quantity: number; imageUrl?: string | null };

const KEY = "bit-cart";
const EVENT = "bit-cart-changed";

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
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
  else cart.push({ ...item, quantity: Math.min(20, quantity) });
  save(cart);
}

export function setQty(id: string, quantity: number) {
  let cart = getCart();
  if (quantity <= 0) cart = cart.filter((c) => c.id !== id);
  else cart = cart.map((c) => (c.id === id ? { ...c, quantity: Math.min(20, quantity) } : c));
  save(cart);
}

export function removeFromCart(id: string) {
  save(getCart().filter((c) => c.id !== id));
}

export function clearCart() {
  save([]);
}

export function cartCount(cart: CartEntry[]): number {
  return cart.reduce((n, c) => n + c.quantity, 0);
}

export const CART_EVENT = EVENT;
