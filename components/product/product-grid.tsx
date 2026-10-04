import { ProductCard } from "./product-card";
import type { Product } from "@/types";

export function ProductGrid({ products, priorityCount = 0, headingLevel }: { products: Product[]; priorityCount?: number; headingLevel?: "h2" | "h3" }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
