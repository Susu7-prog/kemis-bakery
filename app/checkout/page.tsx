import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { displayName, getCurrentUser } from "@/lib/auth/session";
import { isOrderingConfigured } from "@/lib/env";

// Depends on the visitor's session cookie, so it must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <Container className="py-10 sm:py-16">
      <h1 className="text-headline">Checkout</h1>
      <CheckoutForm
        orderingAvailable={isOrderingConfigured()}
        defaults={{ fullName: user ? displayName(user) : "", email: user?.email ?? "" }}
        signedIn={Boolean(user)}
      />
    </Container>
  );
}
