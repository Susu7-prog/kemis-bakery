import {
  isValidIdempotencyKey,
  validateCheckoutFields,
  validateOrderItems,
  type CheckoutErrors,
  type CheckoutFields,
  type OrderLineInput,
} from "../validation/checkout.ts";
import { buildOrderConfirmation } from "../email/order-confirmation.ts";

export type CreatedOrder = {
  orderId: string;
  orderNumber: string;
  accessToken: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  total: number;
  createdAt: string;
  items: { name: string; price: number; quantity: number }[];
  duplicate: boolean;
  emailSent: boolean;
};

export type RejectionCode =
  | "insufficient_stock"
  | "product_not_found"
  | "invalid_quantity"
  | "invalid_items"
  | "invalid_request"
  | "price_changed";

export type CartLineUpdate = { productId: string; price: number; stock: number };

export type CreateOrderOutcome =
  | { kind: "created"; order: CreatedOrder }
  | { kind: "rejected"; error: RejectionCode; productId?: string; name?: string; available?: number; lines?: CartLineUpdate[] };

export type OrderDeps = {
  createOrder(args: {
    idempotencyKey: string;
    userId: string | null;
    fields: CheckoutFields;
    items: OrderLineInput[];
    expectedSubtotal: number | null;
  }): Promise<CreateOrderOutcome>;
  sendEmail(message: { to: string; subject: string; html: string; text: string }): Promise<{ ok: boolean }>;
  markEmailSent(orderId: string): Promise<void>;
  log?(event: string, data?: Record<string, unknown>): void;
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; orderId: string; accessToken: string; total: number; emailSent: boolean; duplicate: boolean }
  | { ok: false; code: "validation"; fieldErrors: CheckoutErrors; message: string }
  | { ok: false; code: "cart"; reason: string; message: string; productId?: string; available?: number; lines?: CartLineUpdate[] }
  | { ok: false; code: "rejected" | "server"; message: string };

const SERVER_ERROR = "We couldn't place your order. Please try again in a moment.";

/**
 * Validates, creates the order atomically, then sends the confirmation email.
 * The email is best effort: a failure is recorded but never fails or repeats the order.
 */
export async function placeOrder(deps: OrderDeps, raw: unknown, userId: string | null): Promise<PlaceOrderResult> {
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  // Honeypot: people never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return { ok: false, code: "rejected", message: SERVER_ERROR };
  }

  const fields = validateCheckoutFields(body.fields);
  if (!fields.ok) {
    return { ok: false, code: "validation", fieldErrors: fields.errors, message: "Please fix the highlighted fields." };
  }

  const items = validateOrderItems(body.items);
  if (!items.ok) {
    return { ok: false, code: "cart", reason: "invalid_cart", message: "Your cart is empty or contains an invalid item. Please review it and try again." };
  }

  if (!isValidIdempotencyKey(body.idempotencyKey)) {
    return { ok: false, code: "server", message: SERVER_ERROR };
  }

  const expectedSubtotal =
    typeof body.expectedSubtotal === "number" && Number.isFinite(body.expectedSubtotal) && body.expectedSubtotal >= 0
      ? body.expectedSubtotal
      : null;

  let outcome: CreateOrderOutcome;
  try {
    outcome = await deps.createOrder({
      idempotencyKey: body.idempotencyKey,
      userId,
      fields: fields.data,
      items: items.items,
      expectedSubtotal,
    });
  } catch (error) {
    deps.log?.("order_create_failed", { message: error instanceof Error ? error.message : "unknown" });
    return { ok: false, code: "server", message: SERVER_ERROR };
  }

  if (outcome.kind === "rejected") {
    switch (outcome.error) {
      case "insufficient_stock":
        return {
          ok: false, code: "cart", reason: "insufficient_stock", productId: outcome.productId, available: outcome.available,
          message: outcome.available && outcome.available > 0
            ? `Only ${outcome.available} of ${outcome.name ?? "an item"} left. We've updated your cart.`
            : `${outcome.name ?? "An item"} has just sold out. We've updated your cart.`,
        };
      case "product_not_found":
        return { ok: false, code: "cart", reason: "unavailable", productId: outcome.productId, message: "An item in your cart is no longer available." };
      case "price_changed":
        return { ok: false, code: "cart", reason: "price_changed", lines: outcome.lines, message: "Some prices have changed. We've updated your cart; please review the new total." };
      default:
        return { ok: false, code: "cart", reason: "invalid_cart", message: "Your cart contains an invalid item. Please review it and try again." };
    }
  }

  const order = outcome.order;
  let emailSent = order.emailSent;

  if (!emailSent) {
    try {
      const message = buildOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        createdAt: order.createdAt,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
      });
      const result = await deps.sendEmail({ to: order.customerEmail, ...message });
      if (result.ok) {
        emailSent = true;
        try {
          await deps.markEmailSent(order.orderId);
        } catch (error) {
          deps.log?.("mark_email_sent_failed", { orderNumber: order.orderNumber, message: error instanceof Error ? error.message : "unknown" });
        }
      } else {
        deps.log?.("confirmation_email_not_sent", { orderNumber: order.orderNumber });
      }
    } catch (error) {
      deps.log?.("confirmation_email_error", { orderNumber: order.orderNumber, message: error instanceof Error ? error.message : "unknown" });
    }
  }

  return {
    ok: true, orderNumber: order.orderNumber, orderId: order.orderId, accessToken: order.accessToken,
    total: order.total, emailSent, duplicate: order.duplicate,
  };
}
