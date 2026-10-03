import { Container } from "@/components/layout/container";

const principles = [
  {
    title: "Small runs",
    body: "Each piece is made in batches we can describe, so nothing sits in a warehouse for a season.",
  },
  {
    title: "Named materials",
    body: "Every product page lists what it is made of and who made it.",
  },
  {
    title: "Repairable by design",
    body: "Bulbs, cords, glazes and fittings can be replaced, so a good object stays in use.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-title" className="border-t border-line bg-surface py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <h2 id="principles-title" className="text-headline">
          What sets NOVA apart.
        </h2>
        <dl className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {principles.map((p) => (
            <div key={p.title} className="border-t border-ink pt-5">
              <dt className="font-display text-title">{p.title}</dt>
              <dd className="mt-3 text-muted">{p.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
