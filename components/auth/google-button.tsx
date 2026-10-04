"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { NEXT_COOKIE, NEXT_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth/next-cookie";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.7-3.78H1.35v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.36 14.31a7.2 7.2 0 0 1 0-4.62V6.6H1.35a12 12 0 0 0 0 10.8l4.01-3.09z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.35 6.6l4.01 3.09A7.15 7.15 0 0 1 12 4.77z" />
    </svg>
  );
}

export function GoogleSignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign-in isn't available right now. Please try again later.");
      setPending(false);
      return;
    }
    document.cookie = `${NEXT_COOKIE}=${encodeURIComponent(next)}; Path=/; Max-Age=${NEXT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser navigates to Google, so only failures return here.
    if (oauthError) {
      setError("We couldn't start Google sign-in. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button size="lg" variant="secondary" className="w-full" onClick={signIn} disabled={pending} aria-busy={pending}>
        <GoogleMark />
        {pending ? "Redirecting to Google..." : "Continue with Google"}
      </Button>
      {error && <p role="alert" className="text-caption text-danger">{error}</p>}
    </div>
  );
}
