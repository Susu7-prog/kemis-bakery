import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const swatches = [
  ["paper", "bg-paper"],
  ["surface", "bg-surface"],
  ["ink", "bg-ink"],
  ["muted", "bg-muted"],
  ["line", "bg-line"],
  ["accent", "bg-accent"],
  ["accent-soft", "bg-accent-soft"],
  ["danger", "bg-danger"],
  ["success", "bg-success"],
] as const;

export default function StyleGuidePage() {
  return (
    <Container className="space-y-16 py-16">
      <header>
        <h1 className="text-headline">Style guide</h1>
        <p className="mt-4 max-w-xl text-muted">
          Internal reference for the NOVA foundation. Not indexed by search engines.
        </p>
      </header>

      <section aria-labelledby="sg-colour" className="space-y-6">
        <h2 id="sg-colour" className="text-title">Colour</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {swatches.map(([name, cls]) => (
            <li key={name}>
              <div className={`h-20 rounded-md border border-line ${cls}`} />
              <p className="mt-2 text-caption">{name}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sg-type" className="space-y-4">
        <h2 id="sg-type" className="text-title">Type</h2>
        <p className="text-display">Display</p>
        <p className="font-display text-headline font-semibold">Headline</p>
        <p className="font-display text-title font-semibold">Title</p>
        <p className="text-lead">Lead paragraph for introductions and summaries.</p>
        <p>Body text for descriptions and product detail.</p>
        <p className="text-caption text-muted">Caption for labels and supporting detail.</p>
      </section>

      <section aria-labelledby="sg-buttons" className="space-y-6">
        <h2 id="sg-buttons" className="text-title">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Add to cart</Button>
          <Button variant="secondary">View details</Button>
          <Button variant="quiet">Learn more</Button>
          <Button disabled>Sold out</Button>
          <ButtonLink href="/" size="lg">Large link button</ButtonLink>
        </div>
      </section>

      <section aria-labelledby="sg-forms" className="space-y-6">
        <h2 id="sg-forms" className="text-title">Form fields</h2>
        <div className="grid max-w-xl gap-5">
          <Field id="sg-name" label="Full name" placeholder="Amaka Obi" autoComplete="off" />
          <Field id="sg-email" label="Email" type="email" hint="We only use this for order updates." autoComplete="off" />
          <Field id="sg-phone" label="Phone" type="tel" error="Enter a Nigerian phone number, for example 0803 123 4567." autoComplete="off" />
        </div>
      </section>
    </Container>
  );
}
