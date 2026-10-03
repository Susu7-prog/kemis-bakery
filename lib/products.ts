import { cache } from "react";
import { products as localProducts } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { getPublicSupabase } from "@/lib/supabase/public";
import type { CategorySlug, Product, ProductBadge, ProductSort } from "@/types";

/* ---------- Sorting and validation helpers (pure) ---------- */

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

export function getCategoryName(slug: CategorySlug): string {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

/* ---------- Data source ---------- */

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  image_url: string;
  gallery_urls: string[] | null;
  category: CategorySlug;
  stock: number;
  badge: ProductBadge | null;
};

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    galleryUrls: row.gallery_urls?.length ? row.gallery_urls : [row.image_url],
    category: row.category,
    stock: row.stock,
    badge: row.badge ?? undefined,
  };
}

/**
 * Loads the whole catalogue. Uses Supabase when it is configured and the bundled catalogue
 * otherwise (local development without a database). If Supabase IS configured and fails,
 * this throws, so the UI shows its error state rather than silently showing stale data.
 * The catalogue is small, so filtering and sorting happen in memory; move them into the
 * query if it grows past a few hundred products.
 */
const loadCatalogue = cache(async (): Promise<Product[]> => {
  const supabase = getPublicSupabase();
  if (!supabase) return localProducts;

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, description, price, image_url, gallery_urls, category, stock, badge")
    .order("created_at", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[catalogue] failed to load products", error.code, error.message);
    throw new Error("Catalogue unavailable");
  }
  return (data as ProductRow[]).map(fromRow);
});

/* ---------- Queries ---------- */

type Query = { q?: string; category?: CategorySlug; sort?: ProductSort };

/** Every search term must match the product's name, description or category name. */
export async function getProducts({ q, category, sort = "featured" }: Query = {}): Promise<Product[]> {
  const all = await loadCatalogue();
  const terms = (q ?? "").toLowerCase().split(/\s+/).filter(Boolean);

  const matched = all.filter((product) => {
    if (category && product.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = `${product.name} ${product.description} ${getCategoryName(product.category)}`.toLowerCase();
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

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await loadCatalogue();
  return all.find((p) => p.slug === slug);
}

export async function getProductsBySlugs(slugs: readonly string[]): Promise<Product[]> {
  const all = await loadCatalogue();
  return slugs.map((slug) => all.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p));
}

export async function getBestsellers(limit = 4): Promise<Product[]> {
  const all = await loadCatalogue();
  return all.filter((p) => p.badge === "Bestseller").slice(0, limit);
}

/** Same-category products first (in stock before sold out), then others, never the product itself. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const others = (await loadCatalogue()).filter((p) => p.id !== product.id);
  const rank = (p: Product) => (p.category === product.category ? 0 : 2) + (p.stock > 0 ? 0 : 1);
  return [...others].sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

export async function getAllSlugs(): Promise<string[]> {
  return (await loadCatalogue()).map((p) => p.slug);
}

export async function getCategoryCount(slug: CategorySlug): Promise<number> {
  return (await loadCatalogue()).filter((p) => p.category === slug).length;
}

export async function getCategoryCover(slug: CategorySlug): Promise<Product | undefined> {
  return (await loadCatalogue()).find((p) => p.category === slug);
}
