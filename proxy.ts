import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Runs only where a session matters, so public pages stay static and cacheable.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/account/:path*", "/checkout", "/login", "/order-success/:path*"],
};
