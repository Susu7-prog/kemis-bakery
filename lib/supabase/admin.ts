import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Service-role client. It bypasses Row Level Security, so it is only ever used in server code
 * for privileged operations (creating orders, reading an order for its confirmation page).
 */
export function getAdminSupabase(): SupabaseClient | null {
  if (client) return client;
  const config = getSupabaseAdminConfig();
  if (!config) return null;
  client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
