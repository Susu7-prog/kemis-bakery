import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { getProductsBySlugs } from "@/lib/products";

const heroSlugs = ["agege-loaf", "meat-pie-box", "suya-spice-yaji"] as const;
const offsets = ["lg:translate-y-0", "lg:translate-y-16", "lg:-translate-y-6"] as const;

export function Hero() {
  const items = getProductsBySlugs(heroSlugs);
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden">
      <Container className="grid gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-20">
        <div>
          <h1 id="hero-title" className="text-display">
            African bakes and spices, made in small batches.
          </h1>
          <p className="mt-7 max-w-xl text-lead text-muted">
            Kemi&rsquo;s is an artisanal bakery and spice shop. We bake breads, pastries and cakes
            from scratch and blend our own spice mixes, using ingredients we can name.
          </p>
          <div className="mt-9 flex flex-col gap-3 xs:flex-row">
            <ButtonLink href="/shop" size="lg">Shop the bakery</ButtonLink>
            <ButtonLink href="/shop?category=spices" size="lg" variant="secondary">Explore spices</ButtonLink>
          </div>
        </div>

        <ul className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-5" aria-label="Featured products">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`animate-rise ${offsets[index]} ${index === 2 ? "hidden sm:block" : ""}`}
              style={{ animationDelay: `${index * 140}ms` }}
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-md bg-surface">
                <Image src={item.imageUrl} alt={item.name} fill priority sizes="(min-width: 1024px) 18vw, 33vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
