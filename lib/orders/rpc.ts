import type { CartLineUpdate, CreateOrderOutcome, RejectionCode } from "./place-order.ts";

const REJECTIONS: RejectionCode[] = [
  "insufficient_stock", "product_not_found", "invalid_quantity", "invalid_items", "invalid_request", "price_changed",
];

type Json = Record<string, unknown>;
const num = (v: unknown): number => Number(v);

/** Converts the JSON returned by the create_order() SQL function into a typed outcome. */
export function parseCreateOrderResult(data: unknown): CreateOrderOutcome {
  if (!data || typeof data !== "object") throw new Error("create_order returned no data");
  const r = data as Json;

  if (r.ok === true) {
    const items = Array.isArray(r.items) ? (r.items as Json[]) : [];
    return {
      kind: "created",
      order: {
        orderId: String(r.order_id),
        orderNumber: String(r.order_number),
        accessToken: String(r.access_token),
        customerName: String(r.customer_name),
        customerEmail: String(r.customer_email),
        subtotal: num(r.subtotal),
        total: num(r.total),
        createdAt: String(r.created_at),
        items: items.map((i) => ({ name: String(i.name), price: num(i.price), quantity: num(i.quantity) })),
        duplicate: r.duplicate === true,
        emailSent: r.email_sent === true,
      },
    };
  }

  const error = REJECTIONS.find((code) => code === r.error);
  if (!error) throw new Error("create_order returned an unknown result");
  const lines = Array.isArray(r.lines)
    ? (r.lines as Json[]).map((l): CartLineUpdate => ({ productId: String(l.product_id), price: num(l.price), stock: num(l.stock) }))
    : undefined;
  return {
    kind: "rejected",
    error,
    productId: typeof r.product_id === "string" ? r.product_id : undefined,
    name: typeof r.name === "string" ? r.name : undefined,
    available: typeof r.available === "number" ? r.available : undefined,
    lines,
  };
}
