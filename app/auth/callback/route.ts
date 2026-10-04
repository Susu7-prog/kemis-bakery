import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { NEXT_COOKIE } from "@/lib/auth/next-cookie";

/** OAuth return point: swaps the one-time code for a session cookie, then sends the visitor on. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  // Behind a proxy or load balancer the public host and protocol come from the x-forwarded-* headers.
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const base = forwardedHost ? `${forwardedProto ?? request.nextUrl.protocol.replace(":", "")}://${forwardedHost}` : origin;

  let next = "/account";
  const saved = request.cookies.get(NEXT_COOKIE)?.value;
  if (saved) {
    try {
      next = safeNextPath(decodeURIComponent(saved));
    } catch {
      next = "/account";
    }
  } else {
    next = safeNextPath(searchParams.get("next"));
  }

  const finish = (target: string) => {
    const response = NextResponse.redirect(`${base}${target}`);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  };
  const fail = (code: string) => finish(`/login?error=${code}&next=${encodeURIComponent(next)}`);

  if (searchParams.get("error")) return fail(searchParams.get("error") === "access_denied" ? "denied" : "auth");

  const code = searchParams.get("code");
  const supabase = await createSupabaseServerClient();
  if (!code || !supabase) return fail("auth");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth] code exchange failed", error.status, error.message);
    return fail("auth");
  }
  return finish(next);
}
