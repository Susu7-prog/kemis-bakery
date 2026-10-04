/**
 * Where to send the customer after Google sign-in. It travels in a short-lived cookie rather than
 * in the OAuth redirect URL, because Supabase matches the redirect URL against an allow-list and
 * a query string on it can cause the match to fail and the sign-in to land on the wrong page.
 */
export const NEXT_COOKIE = "kemis_auth_next";
export const NEXT_COOKIE_MAX_AGE_SECONDS = 600;
