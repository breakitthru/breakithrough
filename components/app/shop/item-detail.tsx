"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Ruler, Check, Plus, ShoppingCartSimple, X } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/components/app/shop/cart";

export type ShopItemDetail = {
  id: string;
  title: string;
  description: string | null;
  priceInr: number;
  imageUrl: string | null;
  hasSizes: boolean;
  sizes: string[];
  sizeChartUrl: string | null;
  stock: number | null;
};

export function ItemDetail({ item }: { item: ShopItemDetail }) {
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [chart, setChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const out = item.stock !== null && item.stock <= 0;

  const add = () => {
    if (item.hasSizes && !size) { setError("Please choose a size first."); return; }
    setError(null);
    addToCart({ id: item.id, size, title: item.title, priceInr: item.priceInr, imageUrl: item.imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-[880px]">
      <Link href="/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image */}
        <Card className="flex aspect-square items-center justify-center overflow-hidden p-0">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <ShoppingBag size={56} className="text-[var(--color-ink-faint)]" />
          )}
        </Card>

        {/* Details */}
        <div>
          <h1 className="font-display text-[2.25rem] leading-tight text-[var(--color-ink)]">{item.title}</h1>
          <p className="mt-2 font-display text-2xl text-[var(--color-ink)]">₹{item.priceInr}</p>
          {item.description && <p className="mt-4 whitespace-pre-line text-[var(--color-ink-muted)]">{item.description}</p>}

          {item.hasSizes && item.sizes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow">Size</span>
                {item.sizeChartUrl && (
                  <button onClick={() => setChart(true)} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline">
                    <Ruler size={15} /> Size chart
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {item.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setError(null); }}
                    className={`min-w-11 rounded-[var(--radius-md)] border px-3 py-2 text-sm transition-colors ${size === s ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] font-medium text-[var(--color-ink)]" : "border-[var(--color-line-strong)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-muted)]"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-[var(--color-crisis)]">{error}</p>}

          <div className="mt-7 flex flex-wrap gap-3">
            {out ? (
              <Button variant="outline" size="lg" disabled>Out of stock</Button>
            ) : (
              <Button variant={added ? "outline" : "primary"} size="lg" onClick={add}>
                {added ? (<><Check size={18} /> Added to cart</>) : (<><Plus size={18} /> Add to cart</>)}
              </Button>
            )}
            <Link href="/shop/cart">
              <Button variant="outline" size="lg"><ShoppingCartSimple size={18} /> Go to cart</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Size chart modal */}
      {chart && item.sizeChartUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setChart(false)}>
          <div className="relative max-h-[85vh] max-w-[720px] overflow-auto rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setChart(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
              <X size={16} />
            </button>
            <p className="eyebrow mb-3">Size chart</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.sizeChartUrl} alt="Size chart" className="w-full rounded-[var(--radius-md)]" />
          </div>
        </div>
      )}
    </div>
  );
}
