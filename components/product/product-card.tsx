import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getCategoryName } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";
import type { Product } from "@/types";

function Availability({ stock }: { stock: number }) {
  if (stock < 1) return <p className="text-caption font-medium text-danger">Sold out</p>;
  if (stock <= 5) return <p className="text-caption font-medium text-accent">Only {stock} left</p>;
  return <p className="text-caption text-success">In stock</p>;
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const soldOut = product.stock < 1;
  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-surface">
        <Image
          src={product.imageUrl}
          alt={`${product.name}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={soldOut ? "object-cover opacity-60" : "object-cover"}
        />
        {product.badge && !soldOut && (
          <div className="absolute left-3 top-3"><Badge tone={product.badge === "New" ? "accent" : "turmeric"}>{product.badge}</Badge></div>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-caption text-muted">{getCategoryName(product.category)}</p>
        <h3 className="mt-1 font-display text-lead font-semibold leading-snug">{product.name}</h3>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="font-medium">{formatPrice(product.price)}</p>
          <Availability stock={product.stock} />
        </div>
        <AddToCartButton product={product} className="mt-4 w-full" />
      </div>
    </article>
  );
}
