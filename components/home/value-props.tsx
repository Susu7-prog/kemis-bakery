import { Container } from "@/components/layout/container";

const props = [
  { title: "Baked in small batches", body: "We bake for the orders we have, so what reaches you is fresh rather than from a shelf." },
  { title: "Spices blended by hand", body: "Our blends are mixed in small amounts, so the aroma is still there when you open the jar." },
  { title: "Ingredients we can name", body: "Butter, flour, fruit and whole spices. If we wouldn't cook with it at home, it isn't in the recipe." },
];

export function ValueProps() {
  return (
    <section aria-labelledby="values-title" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <h2 id="values-title" className="text-headline">Why Kemi&rsquo;s.</h2>
        <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {props.map((p) => (
            <div key={p.title} className="border-t-4 border-turmeric pt-5">
              <dt className="font-display text-title">{p.title}</dt>
              <dd className="mt-3 text-muted">{p.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
