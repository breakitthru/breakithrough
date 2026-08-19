"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gift, Lock, CheckCircle, ShoppingBag, ShoppingCartSimple, Plus, Check, Package } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RedeemButton } from "@/components/app/redeem-button";
import { addToCart, getCart, cartCount, CART_EVENT } from "@/components/app/shop/cart";

export type RewardCard = { id: string; title: string; description: string | null; pointsCost: number; featured: boolean };
export type StoreItem = { id: string; title: string; description: string | null; priceInr: number; imageUrl: string | null; stock: number | null; featured: boolean; hasSizes: boolean };

export function ShopTabs({
  balance,
  rewards,
  redeemedIds,
  items,
}: {
  balance: number;
  rewards: RewardCard[];
  redeemedIds: string[];
  items: StoreItem[];
}) {
  const [tab, setTab] = useState<"store" | "rewards">(items.length > 0 ? "store" : "rewards");
  const [count, setCount] = useState(0);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCount(cartCount(getCart()));
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  const redeemed = new Set(redeemedIds);

  const add = (item: StoreItem) => {
    addToCart({ id: item.id, title: item.title, priceInr: item.priceInr, imageUrl: item.imageUrl });
    setAdded(item.id);
    setTimeout(() => setAdded((a) => (a === item.id ? null : a)), 1200);
  };

  return (
    <div className="mx-auto max-w-[880px]">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow text-[var(--color-accent)]">{balance} points to spend</p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-tight text-[var(--color-ink)]">The shop.</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/shop/orders"
            className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
          >
            <Package size={18} /> Orders
          </Link>
          <Link
            href="/shop/cart"
            className="relative flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)] px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
          >
            <ShoppingCartSimple size={18} /> Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-semibold text-[var(--color-accent-fg)]">{count}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-[var(--color-line)]">
        <button
          onClick={() => setTab("store")}
          className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors ${tab === "store" ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
        >
          Buy with money
        </button>
        <button
          onClick={() => setTab("rewards")}
          className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm transition-colors ${tab === "rewards" ? "border-[var(--color-accent)] font-medium text-[var(--color-ink)]" : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}`}
        >
          Redeem with points
        </button>
      </div>

      {tab === "store" ? (
        items.length === 0 ? (
          <Card className="mt-6 p-10 text-center text-sm text-[var(--color-ink-muted)]">Nothing in the store yet. Check back soon.</Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const out = item.stock !== null && item.stock <= 0;
              return (
                <Link key={item.id} href={`/shop/item/${item.id}`} className="group block">
                  <Card className={`flex h-full flex-col overflow-hidden p-0 transition-colors group-hover:border-[var(--color-line-strong)] ${out ? "opacity-60" : ""}`}>
                    <div className="flex h-40 items-center justify-center bg-[var(--color-surface-sunken)]">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag size={36} className="text-[var(--color-ink-faint)]" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-semibold text-[var(--color-ink)]">{item.title}</h3>
                      {item.description && <p className="mt-0.5 line-clamp-2 text-sm text-[var(--color-ink-muted)]">{item.description}</p>}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-display text-lg text-[var(--color-ink)]">₹{item.priceInr}</span>
                        {out ? (
                          <span className="text-sm text-[var(--color-ink-muted)]">Out of stock</span>
                        ) : item.hasSizes ? (
                          <Button size="sm" variant="primary">Select options</Button>
                        ) : (
                          <Button
                            size="sm"
                            variant={added === item.id ? "outline" : "primary"}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(item); }}
                          >
                            {added === item.id ? (<><Check size={16} /> Added</>) : (<><Plus size={16} /> Add to cart</>)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )
      ) : rewards.length === 0 ? (
        <Card className="mt-6 p-10 text-center text-sm text-[var(--color-ink-muted)]">No point rewards yet.</Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rewards.map((r) => {
            const isRedeemed = redeemed.has(r.id);
            const affordable = balance >= r.pointsCost;
            const locked = !isRedeemed && !affordable;
            return (
              <Card key={r.id} className={`flex flex-col p-5 ${locked ? "opacity-60" : ""}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                  <Gift size={22} />
                </span>
                <h3 className="mt-3 font-semibold text-[var(--color-ink)]">{r.title}</h3>
                {r.description && <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{r.description}</p>}
                <div className="mt-3">
                  {isRedeemed ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-success)]"><CheckCircle size={16} weight="fill" /> Redeemed</span>
                  ) : affordable ? (
                    <RedeemButton rewardId={r.id} pointsCost={r.pointsCost} affordable />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)]"><Lock size={14} /> {r.pointsCost} points</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
