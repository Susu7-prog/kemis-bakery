"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { createOrderDeps } from "@/lib/orders/repository";
import { placeOrder, type CartLineUpdate } from "@/lib/orders/place-order";
import { grantOrderAccess } from "@/lib/orders/confirmation-access";
import type { CheckoutErrors } from "@/lib/validation/checkout";

export type PlaceOrderActionResult =
  | { ok: true; orderNumber: string; emailSent: boolean }
  | { ok: false; code: "validation"; fieldErrors: CheckoutErrors; message: string }
  | { ok: false; code: "cart"; reason: string; message: string; productId?: string; available?: number; lines?: CartLineUpdate[] }
  | { ok: false; code: "rejected" | "server"; message: string };

/**
 * Server Action behind the checkout form. The browser sends product ids and quantities only;
 * prices, stock and totals are always read from the database inside create_order().
 */
export async function placeOrderAction(raw: unknown): Promise<PlaceOrderActionResult> {
  const deps = createOrderDeps();
  if (!deps) {
    return { ok: false, code: "server", message: "Ordering isn't available right now. Please try again later." };
  }

  const user = await getCurrentUser();
  const result = await placeOrder(deps, raw, user?.id ?? null);
  if (!result.ok) return result;

  await grantOrderAccess(result.orderNumber, result.accessToken);
  return { ok: true, orderNumber: result.orderNumber, emailSent: result.emailSent };
}
