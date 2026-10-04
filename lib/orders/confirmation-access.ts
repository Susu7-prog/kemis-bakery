import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const ORDER_ACCESS_COOKIE = "kemis_order_access";

/** Remembers, in an httpOnly cookie, that this browser placed the order. */
export async function grantOrderAccess(orderNumber: string, accessToken: string) {
  (await cookies()).set(ORDER_ACCESS_COOKIE, `${orderNumber}:${accessToken}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export type ConfirmationOrder = {
  id: string;
  orderNumber: string;
  userId: string | null;
  customerEmail: string;
  total: number;
  emailSent: boolean;
};

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Loads an order for its confirmation page. Order numbers are sequential and guessable, so the
 * order is only returned to the browser that placed it (matching secret token in the cookie)
 * or to the signed-in owner.
 */
export async function getOrderForConfirmation(orderNumber: string, viewerId: string | null): Promise<ConfirmationOrder | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data, error } = await admin
    .from("orders")
    .select("id, order_number, user_id, customer_email, total, access_token, confirmation_email_sent_at")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error || !data) return null;

  const cookie = (await cookies()).get(ORDER_ACCESS_COOKIE)?.value ?? "";
  const separator = cookie.indexOf(":");
  const cookieNumber = separator > 0 ? cookie.slice(0, separator) : "";
  const cookieToken = separator > 0 ? cookie.slice(separator + 1) : "";
  const holdsToken = cookieNumber === data.order_number && safeEqual(cookieToken, String(data.access_token));
  const isOwner = viewerId !== null && data.user_id === viewerId;
  if (!holdsToken && !isOwner) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    userId: data.user_id,
    customerEmail: data.customer_email,
    total: Number(data.total),
    emailSent: Boolean(data.confirmation_email_sent_at),
  };
}
