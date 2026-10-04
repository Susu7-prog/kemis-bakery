import type { MailgunConfig } from "@/lib/email/mailgun-client";

/**
 * Central, typed access to environment configuration.
 * Only NEXT_PUBLIC_* values may ever reach the browser; everything else stays server-side.
 * Do not import this module from a client component.
 */
export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseAdminConfig(): { url: string; serviceRoleKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function getMailgunConfig(): MailgunConfig | null {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;
  if (!apiKey || !domain || !from) return null;
  return { apiKey, domain, from, baseUrl: process.env.MAILGUN_API_BASE_URL || undefined };
}

/** Ordering needs the database (public + service-role access). Email is optional. */
export function isOrderingConfigured(): boolean {
  return getSupabasePublicConfig() !== null && getSupabaseAdminConfig() !== null;
}
