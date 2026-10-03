import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="py-20">
      <div className="max-w-md space-y-4">
        <h1 className="text-headline">That page isn&rsquo;t on the menu.</h1>
        <p className="text-muted">The link may be old or mistyped. The shop has everything we&rsquo;re baking right now.</p>
        <ButtonLink href="/shop">Go to the shop</ButtonLink>
      </div>
    </Container>
  );
}
