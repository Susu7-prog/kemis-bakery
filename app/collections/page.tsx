import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { categories } from "@/lib/data/categories";
import { getCategoryCount, getCategoryCover } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse Kemi's by breads, pastries and snacks, cakes, and spice blends.",
};

export default async function CollectionsPage() {
  const entries = await Promise.all(
    categories.map(async (c) => ({ c, cover: await getCategoryCover(c.slug), count: await getCategoryCount(c.slug) })),
  );
  return (
    <Container className="py-10 sm:py-16">
      <h1 className="text-headline">Collections</h1>
      <p className="mt-4 max-w-xl text-lead text-muted">Four ways into the range. Pick one and we&rsquo;ll show you what&rsquo;s fresh.</p>
      <ul className="mt-12 grid gap-8 sm:grid-cols-2">
        {entries.map(({ c, cover, count }) => {
          return (
            <li key={c.slug}>
              <Link href={`/shop?category=${c.slug}`} className="group grid grid-cols-[40%_1fr] items-center gap-5 sm:gap-6">
                <div className="relative aspect-4/5 overflow-hidden rounded-md bg-surface">
                  {cover && <Image src={cover.imageUrl} alt="" fill sizes="(min-width: 640px) 20vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div>
                  <h2 className="font-display text-title">{c.name}</h2>
                  <p className="mt-2 text-muted">{c.blurb}</p>
                  <p className="mt-3 text-caption font-medium underline underline-offset-4 decoration-accent decoration-2">{count} products</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
