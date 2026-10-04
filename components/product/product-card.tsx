import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getCategoryName } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";
import { Availability } from "./availability";
import type { Product } from "@/types";

export function ProductCard({ product, priority = false, headingLevel: Heading = "h3" }: { product: Product; priority?: boolean; headingLevel?: "h2" | "h3" }) {
  const soldOut = product.stock < 1;
  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-surface">
        <Link href={`/products/${product.slug}`} tabIndex={-1} aria-hidden="true" className="absolute inset-0 z-0">
        <Image
          src={product.imageUrl}
          alt={`${product.name}`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={soldOut ? "object-cover opacity-60" : "object-cover"}
        />
        </Link>
        {product.badge && !soldOut && (
          <div className="pointer-events-none absolute left-3 top-3"><Badge tone={product.badge === "New" ? "accent" : "turmeric"}>{product.badge}</Badge></div>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-caption text-muted">{getCategoryName(product.category)}</p>
        <Heading className="mt-1 font-display text-lead font-semibold leading-snug">
          <Link href={`/products/${product.slug}`} className="hover:text-accent">{product.name}</Link>
        </Heading>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <p className="font-medium">{formatPrice(product.price)}</p>
          <Availability stock={product.stock} />
        </div>
        <AddToCartButton product={product} className="mt-4 w-full" />
      </div>
    </article>
  );
}
