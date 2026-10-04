import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function OrderConfirmationNotFound() {
  return (
    <Container className="py-20">
      <div className="max-w-md space-y-4">
        <h1 className="text-headline">We can&rsquo;t show that order.</h1>
        <p className="text-muted">Order confirmations are only shown in the browser that placed the order, or to the signed-in customer. If you have just ordered, check your email.</p>
        <div className="flex gap-3">
          <ButtonLink href="/account/orders">Your orders</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">Shop</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
