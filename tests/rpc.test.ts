import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCreateOrderResult } from "../lib/orders/rpc.ts";

test("parses a created order, including numeric strings from Postgres", () => {
  const r = parseCreateOrderResult({
    ok: true, duplicate: false, order_id: "o1", order_number: "KEMI-10001", access_token: "t", customer_name: "A", customer_email: "a@b.co",
    subtotal: "4400.00", total: 4400, created_at: "2026-10-03T12:00:00+00:00", email_sent: false,
    items: [{ name: "Agege Loaf", price: 2200, quantity: 2 }],
  });
  assert.equal(r.kind, "created");
  if (r.kind === "created") { assert.equal(r.order.subtotal, 4400); assert.equal(r.order.items[0].quantity, 2); assert.equal(r.order.duplicate, false); }
});

test("parses rejections, including cart line updates", () => {
  const stock = parseCreateOrderResult({ ok: false, error: "insufficient_stock", product_id: "p", name: "Loaf", available: 1 });
  assert.deepEqual(stock, { kind: "rejected", error: "insufficient_stock", productId: "p", name: "Loaf", available: 1, lines: undefined });
  const price = parseCreateOrderResult({ ok: false, error: "price_changed", subtotal: 5, lines: [{ product_id: "p", price: "2500.00", stock: 3 }] });
  assert.equal(price.kind === "rejected" && price.lines?.[0].price, 2500);
});

test("unknown or empty results are errors, not silent successes", () => {
  assert.throws(() => parseCreateOrderResult(null));
  assert.throws(() => parseCreateOrderResult({ ok: false, error: "something_else" }));
});
