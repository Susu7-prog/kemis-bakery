"use client";

import { useState } from "react";
import { cart } from "@/lib/cart/cart-store";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "@/components/ui/icons";
import type { Product } from "@/types";

const MAX_PER_ORDER = 20;

const stepper =
  "inline-flex size-12 items-center justify-center rounded-md border border-line-strong transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong";

export function ProductPurchase({ product }: { product: Product }) {
  const max = Math.min(product.stock, MAX_PER_ORDER);
  const [quantity, setQuantity] = useState(1);

  if (max < 1) {
    return (
      <Button size="lg" className="w-full" disabled>
        Sold out
      </Button>
    );
  }

  const change = (next: number) => setQuantity(Math.max(1, Math.min(next, max)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span id="qty-label" className="text-caption font-medium">Quantity</span>
        <div role="group" aria-labelledby="qty-label" className="flex items-center gap-2">
          <button type="button" className={stepper} aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => change(quantity - 1)}>
            <MinusIcon width={20} height={20} />
          </button>
          <output aria-live="polite" className="w-10 text-center text-lead tabular-nums">{quantity}</output>
          <button type="button" className={stepper} aria-label="Increase quantity" disabled={quantity >= max} onClick={() => change(quantity + 1)}>
            <PlusIcon width={20} height={20} />
          </button>
        </div>
        {max === MAX_PER_ORDER && product.stock > MAX_PER_ORDER && (
          <span className="text-caption text-muted">Max {MAX_PER_ORDER} per order</span>
        )}
      </div>
      <Button
        size="lg"
        className="w-full"
        aria-haspopup="dialog"
        onClick={() => {
          cart.add(product, quantity);
          setQuantity(1);
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
