import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* The single bold gesture: one accent disc, partly cropped, rising once on load. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-10 size-72 animate-rise rounded-full bg-accent sm:-right-32 sm:size-120 lg:-right-20 lg:top-4 lg:size-160"
      />
      <Container className="relative pb-20 pt-24 sm:pb-28 sm:pt-40 lg:pb-36 lg:pt-52">
        <h1
          id="hero-title"
          className="max-w-4xl text-display text-ink"
        >
          Everyday objects, made to last decades.
        </h1>
        <p className="mt-8 max-w-xl text-lead text-muted">
          NOVA designs lighting, ceramics, desk pieces and textiles in small runs. We sell them
          directly and list every material and maker, so you know exactly what you are buying.
        </p>
        <div className="mt-10 flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/shop" size="lg">
            Shop the collection
          </ButtonLink>
          <ButtonLink href="/collections" size="lg" variant="secondary">
            Browse by room
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
