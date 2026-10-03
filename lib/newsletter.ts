import "server-only";

export type SubscribeResult = { ok: true } | { ok: false; reason: "unavailable" };

/**
 * Newsletter storage arrives with the Supabase phase (a `newsletter_subscribers`
 * table written through the server client). Until then this reports that sign-up
 * is unavailable, so the UI never claims a subscription that wasn't stored.
 */
export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  void email;
  return { ok: false, reason: "unavailable" };
}
