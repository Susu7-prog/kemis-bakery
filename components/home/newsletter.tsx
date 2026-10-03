import { Container } from "@/components/layout/container";
import { NewsletterForm } from "./newsletter-form";

export function Newsletter() {
  return (
    <section aria-labelledby="newsletter-title" className="bg-turmeric-soft py-20 sm:py-24">
      <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <h2 id="newsletter-title" className="text-headline">Hear about new bakes first.</h2>
          <p className="mt-4 max-w-md text-lead text-muted">
            One short email when a seasonal bake or spice blend is released. No spam, unsubscribe any time.
          </p>
        </div>
        <NewsletterForm />
      </Container>
    </section>
  );
}
