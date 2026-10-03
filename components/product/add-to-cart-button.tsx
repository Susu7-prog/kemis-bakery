"use client";

import { cart } from "@/lib/cart/cart-store";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
  const soldOut = product.stock < 1;
  return (
    <Button
      variant="secondary"
      className={className}
      disabled={soldOut}
      aria-haspopup="dialog"
      aria-label={soldOut ? `${product.name}, sold out` : `Add ${product.name} to cart`}
      onClick={() => cart.add(product)}
    >
      {soldOut ? "Sold out" : "Add to cart"}
    </Button>
  );
}
