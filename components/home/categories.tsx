import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { categories } from "@/lib/data/categories";
import { getCategoryCount, getCategoryCover } from "@/lib/products";

export function Categories() {
  return (
    <section aria-labelledby="categories-title" className="border-t border-line bg-surface py-20 sm:py-28">
      <Container>
        <h2 id="categories-title" className="max-w-2xl text-headline">Start with what you&rsquo;re craving.</h2>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {categories.map((category) => {
            const cover = getCategoryCover(category.slug);
            const count = getCategoryCount(category.slug);
            return (
              <li key={category.slug}>
                <Link href={`/shop?category=${category.slug}`} className="group block">
                  <div className="relative aspect-4/5 overflow-hidden rounded-md bg-paper">
                    {cover && (
                      <Image src={cover.imageUrl} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-title">{category.name}</h3>
                  <p className="mt-1 text-muted">{count} {count === 1 ? "product" : "products"}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
