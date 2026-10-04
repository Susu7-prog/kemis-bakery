import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <Container className="py-20">
      <div className="max-w-md space-y-4">
        <h1 className="text-headline">We couldn&rsquo;t find that order.</h1>
        <p className="text-muted">It may belong to a different account, or the link may be mistyped.</p>
        <ButtonLink href="/account/orders">Back to your orders</ButtonLink>
      </div>
    </Container>
  );
}
