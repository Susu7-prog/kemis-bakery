import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getMailgunConfig } from "@/lib/env";
import { createMailgunSender } from "@/lib/email/mailgun-client";
import { parseCreateOrderResult } from "@/lib/orders/rpc";
import type { OrderDeps } from "@/lib/orders/place-order";

/** Wires order placement to Supabase (service role) and Mailgun. Returns null if ordering isn't configured. */
export function createOrderDeps(): OrderDeps | null {
  const admin = getAdminSupabase();
  if (!admin) return null;
  const sendEmail = createMailgunSender(getMailgunConfig());

  return {
    async createOrder({ idempotencyKey, userId, fields, items, expectedSubtotal }) {
      const { data, error } = await admin.rpc("create_order", {
        p_idempotency_key: idempotencyKey,
        p_user_id: userId,
        p_customer_name: fields.fullName,
        p_customer_email: fields.email,
        p_phone: fields.phone,
        p_address: fields.address,
        p_city: fields.city,
        p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        p_expected_subtotal: expectedSubtotal,
      });
      if (error) throw new Error(`create_order failed: ${error.code ?? ""} ${error.message}`);
      return parseCreateOrderResult(data);
    },
    sendEmail,
    async markEmailSent(orderId) {
      const { error } = await admin.from("orders").update({ confirmation_email_sent_at: new Date().toISOString() }).eq("id", orderId);
      if (error) throw new Error(error.message);
    },
    log: (event, data) => console.error(`[orders] ${event}`, data ?? {}),
  };
}
