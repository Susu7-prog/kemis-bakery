import Link from "next/link";
import { Container } from "@/components/layout/container";

export function Story() {
  return (
    <section aria-labelledby="story-title" className="bg-accent text-on-accent">
      <Container className="grid gap-10 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
        <h2 id="story-title" className="text-headline">Baked the way we eat at home.</h2>
        <div className="max-w-xl space-y-5 text-lead">
          <p>
            Kemi&rsquo;s began with a simple idea: the breads, pies and snacks many of us grew up on
            deserve the same care as any artisanal bake.
          </p>
          <p>
            So we make them slowly, in small batches, with real butter, fresh spices and no shortcuts.
            Our spice blends follow the same rule: whole ingredients, roasted and ground in small
            amounts so they stay bright.
          </p>
          <Link href="/about" className="inline-block font-medium underline underline-offset-4 decoration-turmeric decoration-2 hover:decoration-on-accent">
            Read our story
          </Link>
        </div>
      </Container>
    </section>
  );
}
