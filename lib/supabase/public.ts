import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Cookie-less, anonymous client for public reads (the catalogue). It carries no user session,
 * so pages that use it can still be statically generated and cached. Row Level Security
 * limits what it can see. Returns null when Supabase is not configured.
 */
export function getPublicSupabase(): SupabaseClient | null {
  if (client) return client;
  const config = getSupabasePublicConfig();
  if (!config) return null;
  client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
