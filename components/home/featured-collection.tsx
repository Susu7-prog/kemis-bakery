import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ProductGrid } from "@/components/product/product-grid";
import { featuredCollection } from "@/lib/data/products";
import { getProductsBySlugs } from "@/lib/products";

export async function FeaturedCollection() {
  const items = await getProductsBySlugs(featuredCollection.productSlugs);
  return (
    <section aria-labelledby="featured-title" className="bg-accent-soft py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_2.2fr] lg:gap-14">
        <div className="lg:pt-4">
          <h2 id="featured-title" className="text-headline">{featuredCollection.title}</h2>
          <p className="mt-5 max-w-md text-lead text-muted">{featuredCollection.description}</p>
          <Link href="/shop" className="mt-8 inline-block font-medium underline underline-offset-4 decoration-accent decoration-2 hover:text-accent">
            See the whole range
          </Link>
        </div>
        <div className="[&_ul]:lg:grid-cols-3">
          <ProductGrid products={items} />
        </div>
      </Container>
    </section>
  );
}
