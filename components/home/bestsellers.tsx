import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { getBestsellers } from "@/lib/products";

export function Bestsellers() {
  const items = getBestsellers(4);
  return (
    <section aria-labelledby="bestsellers-title" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="bestsellers-title" className="max-w-xl text-headline">What people come back for.</h2>
          <ButtonLink href="/shop" variant="secondary" className="self-start">Shop all products</ButtonLink>
        </div>
        <div className="mt-12">
          <ProductGrid products={items} />
        </div>
      </Container>
    </section>
  );
}
