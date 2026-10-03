import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-md space-y-4">
        <h1 className="text-headline">Sign in</h1>
        <p className="text-muted">Accounts and order history aren&rsquo;t available yet. You&rsquo;ll be able to sign in with Google here soon.</p>
        <ButtonLink href="/shop">Keep shopping</ButtonLink>
      </div>
    </Container>
  );
}
