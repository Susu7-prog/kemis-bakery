import { products } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import type { CategorySlug, Product, ProductSort } from "@/types";

export const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export function isCategorySlug(value: string | undefined): value is CategorySlug {
  return categories.some((c) => c.slug === value);
}

export function isProductSort(value: string | undefined): value is ProductSort {
  return sortOptions.some((s) => s.value === value);
}

type Query = { q?: string; category?: CategorySlug; sort?: ProductSort };

/** Every search term must match the product's name, description or category name. */
export function getProducts({ q, category, sort = "featured" }: Query = {}): Product[] {
  const terms = (q ?? "").toLowerCase().split(/\s+/).filter(Boolean);

  const matched = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (terms.length === 0) return true;
    const categoryName = categories.find((c) => c.slug === product.category)?.name ?? "";
    const haystack = `${product.name} ${product.description} ${categoryName}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  switch (sort) {
    case "price-asc":
      return [...matched].sort((a, b) => a.price - b.price);
    case "price-desc":
      return [...matched].sort((a, b) => b.price - a.price);
    case "name":
      return [...matched].sort((a, b) => a.name.localeCompare(b.name));
    default:
      return matched;
  }
}

export function getProductsBySlugs(slugs: readonly string[]): Product[] {
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export function getBestsellers(limit = 4): Product[] {
  return products.filter((p) => p.badge === "Bestseller").slice(0, limit);
}

export function getCategoryName(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function getCategoryCount(slug: CategorySlug): number {
  return products.filter((p) => p.category === slug).length;
}

export function getCategoryCover(slug: CategorySlug): Product | undefined {
  return products.find((p) => p.category === slug);
}
