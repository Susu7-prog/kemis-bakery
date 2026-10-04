import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** The signed-in user, verified with Supabase, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
});

/** Use at the top of every protected page: authorization is checked here, not only in the proxy. */
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

export function displayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name = (meta?.full_name ?? meta?.name) as unknown;
  return typeof name === "string" && name.trim() ? name.trim() : (user.email?.split("@")[0] ?? "Customer");
}
