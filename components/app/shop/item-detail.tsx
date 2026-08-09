"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Ruler, Check, Plus, Minus, ShoppingCartSimple, ShieldCheck, Truck, X } from "@phosphor-icons/react";
import { Chip } from "@/components/ui/card";
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
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [chart, setChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const out = item.stock !== null && item.stock <= 0;
  const lowStock = item.stock !== null && item.stock > 0 && item.stock <= 5;
  const maxQty = item.stock !== null ? Math.min(item.stock, 20) : 20;

  const add = () => {
    if (item.hasSizes && !size) { setError("Please choose a size first."); return; }
    setError(null);
    addToCart({ id: item.id, size, title: item.title, priceInr: item.priceInr, imageUrl: item.imageUrl }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mx-auto max-w-[1040px]">
      <Link href="/shop" className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="md:sticky md:top-8 md:self-start">
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-surface)]">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <ShoppingBag size={64} className="text-[var(--color-ink-faint)]" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="font-display text-[2.75rem] leading-[1.05] text-[var(--color-ink)]">{item.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-[1.75rem] text-[var(--color-ink)]">₹{item.priceInr}</span>
            {out ? (
              <Chip tone="neutral">Out of stock</Chip>
            ) : lowStock ? (
              <Chip tone="caution">Only {item.stock} left</Chip>
            ) : (
              <Chip tone="success">In stock</Chip>
            )}
          </div>

          {item.description && (
            <p className="mt-5 whitespace-pre-line leading-relaxed text-[var(--color-ink-muted)]">{item.description}</p>
          )}

          <div className="my-7 border-t border-[var(--color-line)]" />

          {/* Size */}
          {item.hasSizes && item.sizes.length > 0 && (
            <div className="mb-7">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="eyebrow">
                  Size{size ? <span className="ml-1.5 font-normal normal-case tracking-normal text-[var(--color-ink-muted)]">· {size}</span> : null}
                </span>
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
                    className={`flex h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border px-3.5 text-sm transition-colors ${
                      size === s
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)] font-medium text-[var(--color-ink)]"
                        : "border-[var(--color-line-strong)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          {!out && (
            <div className="mb-6">
              <span className="eyebrow mb-2.5 block">Quantity</span>
              <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-line-strong)] p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] disabled:opacity-40"><Minus size={15} /></button>
                <span className="w-9 text-center text-sm font-medium text-[var(--color-ink)]">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-sunken)] disabled:opacity-40"><Plus size={15} /></button>
              </div>
            </div>
          )}

          {error && <p className="mb-3 text-sm text-[var(--color-crisis)]">{error}</p>}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {out ? (
              <Button variant="outline" size="lg" disabled>Out of stock</Button>
            ) : (
              <Button variant={added ? "outline" : "primary"} size="lg" onClick={add} className="min-w-52 flex-1 sm:flex-none">
                {added ? (<><Check size={18} /> Added to cart</>) : (<><Plus size={18} /> Add to cart · ₹{item.priceInr * qty}</>)}
              </Button>
            )}
            <Link href="/shop/cart" className="flex-1 sm:flex-none">
              <Button variant="outline" size="lg" className="w-full"><ShoppingCartSimple size={18} /> Go to cart</Button>
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-7 flex flex-col gap-2 border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[var(--color-ink-faint)]" /> Secure checkout with Razorpay — UPI, card or netbanking.</span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-[var(--color-ink-faint)]" /> Shipped to the address you enter at checkout.</span>
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
