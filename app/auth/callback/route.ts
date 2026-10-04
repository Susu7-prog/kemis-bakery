import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

/** OAuth return point: swaps the one-time code for a session cookie, then sends the visitor on. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"));
  const fail = (code: string) => NextResponse.redirect(`${origin}/login?error=${code}&next=${encodeURIComponent(next)}`);

  if (searchParams.get("error")) {
    return fail(searchParams.get("error") === "access_denied" ? "denied" : "auth");
  }

  const code = searchParams.get("code");
  const supabase = await createSupabaseServerClient();
  if (!code || !supabase) return fail("auth");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth] code exchange failed", error.status, error.message);
    return fail("auth");
  }

  // Behind a proxy (Vercel) the public host comes from x-forwarded-host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;
  return NextResponse.redirect(`${base}${next}`);
}
