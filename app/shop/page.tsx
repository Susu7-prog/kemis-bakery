import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { categories } from "@/lib/data/categories";
import { getProducts, isCategorySlug, isProductSort, sortOptions } from "@/lib/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop",
  description: "Breads, pastries, cakes and spice blends from Kemi's Artisanal African Bakery & Spice Shop.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function href(params: { q?: string; category?: string; sort?: string }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.sort && params.sort !== "featured") search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const q = (first(raw.q) ?? "").trim().slice(0, 80);
  const categoryParam = first(raw.category);
  const sortParam = first(raw.sort);
  const category = isCategorySlug(categoryParam) ? categoryParam : undefined;
  const sort = isProductSort(sortParam) ? sortParam : "featured";

  const results = getProducts({ q, category, sort });
  const filtered = Boolean(q || category);

  const pill = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center rounded-md border px-4 text-caption font-medium transition-colors",
      active ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
    );

  return (
    <Container className="py-10 sm:py-16">
      <h1 className="text-headline">Shop</h1>

      <Form action="/shop" role="search" className="mt-8 flex max-w-xl gap-3">
        {category && <input type="hidden" name="category" value={category} />}
        {sort !== "featured" && <input type="hidden" name="sort" value={sort} />}
        <label htmlFor="shop-search" className="sr-only">Search products</label>
        <input id="shop-search" name="q" type="search" defaultValue={q} autoComplete="off"
          placeholder="Search products" className="h-12 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-4 hover:border-ink" />
        <button type="submit" className="h-12 rounded-md bg-accent px-6 font-medium text-on-accent transition-colors hover:bg-accent-strong">Search</button>
      </Form>

      <nav aria-label="Categories" className="-mx-(--gutter) mt-8 overflow-x-auto px-(--gutter)">
        <ul className="flex w-max gap-2 pb-1">
          <li><Link href={href({ q, sort })} className={pill(!category)} aria-current={!category ? "true" : undefined}>All</Link></li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={href({ q, category: c.slug, sort })} className={pill(category === c.slug)}
                aria-current={category === c.slug ? "true" : undefined}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 flex flex-col gap-3 border-y border-line py-4 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-muted">
          {results.length} {results.length === 1 ? "product" : "products"}
          {q && <> for &ldquo;{q}&rdquo;</>}
        </p>
        <nav aria-label="Sort" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-caption">
          <span className="text-muted">Sort by</span>
          {sortOptions.map((o) => (
            <Link key={o.value} href={href({ q, category, sort: o.value })}
              aria-current={sort === o.value ? "true" : undefined}
              className={cn("underline-offset-4", sort === o.value ? "font-medium underline decoration-accent decoration-2" : "hover:underline")}>
              {o.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-10">
        {results.length > 0 ? (
          <ProductGrid products={results} priorityCount={4} />
        ) : (
          <div className="max-w-md space-y-4 py-10">
            <h2 className="font-display text-title">Nothing matches that search.</h2>
            <p className="text-muted">Try a shorter word, such as &ldquo;loaf&rdquo; or &ldquo;ginger&rdquo;, or browse everything.</p>
            {filtered && <ButtonLink href="/shop">Clear search and filters</ButtonLink>}
          </div>
        )}
      </div>
    </Container>
  );
}
