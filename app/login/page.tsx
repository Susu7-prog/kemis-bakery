import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { GoogleSignInButton } from "@/components/auth/google-button";
import { getCurrentUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/redirect";
import { getSupabasePublicConfig } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const errorMessages: Record<string, string> = {
  denied: "Google sign-in was cancelled. You can try again whenever you like.",
  auth: "We couldn't sign you in. Please try again.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNextPath(first(params.next));
  const errorKey = first(params.error);

  if (await getCurrentUser()) redirect(next);
  const configured = getSupabasePublicConfig() !== null;

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-headline">Sign in</h1>
          <p className="mt-3 text-muted">Sign in to see your orders. You can also check out as a guest.</p>
        </div>

        {errorKey && (
          <p role="alert" className="rounded-md border border-danger/40 bg-surface p-4 text-danger">
            {errorMessages[errorKey] ?? errorMessages.auth}
          </p>
        )}

        {configured ? (
          <GoogleSignInButton next={next} />
        ) : (
          <p role="status" className="rounded-md border border-line-strong bg-surface p-4 text-muted">
            Sign-in isn&rsquo;t available right now. You can still browse and check out as a guest.
          </p>
        )}
      </div>
    </Container>
  );
}
