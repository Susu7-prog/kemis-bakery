import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <Container className="py-20">
      <div className="max-w-md space-y-4">
        <h1 className="text-headline">We couldn&rsquo;t find that product.</h1>
        <p className="text-muted">It may have sold out for good or the link may be mistyped. Everything we&rsquo;re baking now is in the shop.</p>
        <div className="flex gap-3">
          <ButtonLink href="/shop">Browse the shop</ButtonLink>
          <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
