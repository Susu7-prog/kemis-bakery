import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Availability } from "@/components/product/availability";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPurchase } from "@/components/product/product-purchase";
import { siteConfig } from "@/lib/config/site";
import { formatPrice } from "@/lib/format";
import { getAllSlugs, getCategoryName, getProductBySlug, getRelatedProducts } from "@/lib/products";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { type: "website", title: product.name, description: product.description, url: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const categoryName = getCategoryName(product.category);
  const absolute = (path: string) => new URL(path, siteConfig.url).toString();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    category: categoryName,
    image: product.galleryUrls.map(absolute),
    brand: { "@type": "Brand", name: siteConfig.fullName },
    offers: {
      "@type": "Offer",
      url: absolute(`/products/${product.slug}`),
      priceCurrency: siteConfig.currency,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <Container className="py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="text-caption text-muted">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li><Link href="/shop" className="hover:text-ink hover:underline underline-offset-4">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/shop?category=${product.category}`} className="hover:text-ink hover:underline underline-offset-4">{categoryName}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{product.name}</li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            <ProductGallery name={product.name} images={product.galleryUrls} />
          </div>

          <div className="max-w-xl">
            <p className="text-caption text-muted">{categoryName}</p>
            <h1 className="mt-2 text-headline">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-display text-title">{formatPrice(product.price)}</p>
              {product.badge && product.stock > 0 && <Badge tone={product.badge === "New" ? "accent" : "turmeric"}>{product.badge}</Badge>}
              <Availability stock={product.stock} />
            </div>
            <p className="mt-6 text-lead text-muted">{product.description}</p>
            <div className="mt-8 border-t border-line pt-8">
              <ProductPurchase product={product} />
            </div>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-surface py-16 sm:py-24">
          <Container>
            <h2 id="related-title" className="text-title">You might also like</h2>
            <div className="mt-10"><ProductGrid products={related} /></div>
          </Container>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
