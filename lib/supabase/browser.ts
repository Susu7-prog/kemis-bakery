"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client (anon key only). Used just to start the Google OAuth redirect. */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
