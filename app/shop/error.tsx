"use client";

import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error; // Details are logged server-side; customers only see this message.
  return (
    <Container className="py-20">
      <div role="alert" className="max-w-md space-y-4">
        <h1 className="text-headline">We couldn&rsquo;t load the shop.</h1>
        <p className="text-muted">Something went wrong on our side. Try again, or head back to the homepage.</p>
        <div className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
        </div>
      </div>
    </Container>
  );
}
