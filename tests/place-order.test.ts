import { test } from "node:test";
import assert from "node:assert/strict";
import { placeOrder, type CreateOrderOutcome, type OrderDeps } from "../lib/orders/place-order.ts";

const productId = "dd132556-de18-54e0-b4fe-060152fcddba";
const body = (over: Record<string, unknown> = {}) => ({
  fields: { fullName: "Amaka Obi", email: "amaka@example.com", phone: "08031234567", address: "12 Admiralty Way", city: "Lagos" },
  items: [{ productId, quantity: 2 }],
  idempotencyKey: "3f2b9c1e-7a4d-4e8b-9a61-0c5d2e8f1a77",
  expectedSubtotal: 4400,
  ...over,
});
const created = (over: Record<string, unknown> = {}): CreateOrderOutcome => ({
  kind: "created",
  order: { orderId: "o1", orderNumber: "KEMI-10001", accessToken: "tok", customerName: "Amaka Obi", customerEmail: "amaka@example.com", subtotal: 4400, total: 4400, createdAt: "2026-10-03T12:00:00Z", items: [{ name: "Agege Loaf", price: 2200, quantity: 2 }], duplicate: false, emailSent: false, ...over },
});

function deps(over: Partial<OrderDeps> = {}) {
  const calls = { createOrder: 0, sendEmail: 0, markEmailSent: 0, logs: [] as string[], lastCreate: undefined as unknown, lastEmail: undefined as { to: string; html: string; text: string; idempotencyKey?: string } | undefined };
  const d: OrderDeps = {
    createOrder: async (args) => { calls.createOrder++; calls.lastCreate = args; return created(); },
    sendEmail: async (m) => { calls.sendEmail++; calls.lastEmail = m; return { ok: true }; },
    markEmailSent: async () => { calls.markEmailSent++; },
    log: (event) => { calls.logs.push(event); },
    ...over,
  };
  return { d, calls };
}

test("happy path: creates the order, emails the customer, marks the email sent", async () => {
  const { d, calls } = deps();
  const r = await placeOrder(d, body(), "user-1");
  assert.ok(r.ok);
  if (r.ok) { assert.equal(r.orderNumber, "KEMI-10001"); assert.equal(r.emailSent, true); assert.equal(r.total, 4400); }
  assert.deepEqual([calls.createOrder, calls.sendEmail, calls.markEmailSent], [1, 1, 1]);
  const args = calls.lastCreate as { userId: string; fields: { phone: string } };
  assert.equal(args.userId, "user-1");
  assert.equal(args.fields.phone, "+2348031234567");
  assert.equal(calls.lastEmail?.to, "amaka@example.com");
  assert.match(calls.lastEmail?.text ?? "", /KEMI-10001/);
  assert.match(calls.lastEmail?.text ?? "", /12 Admiralty Way, Lagos/);
  assert.equal((calls.lastEmail as { idempotencyKey?: string } | undefined)?.idempotencyKey, "order-confirmation-o1");
});

test("invalid input never reaches the database", async () => {
  const { d, calls } = deps();
  const bad = await placeOrder(d, body({ fields: { fullName: "", email: "x", phone: "1", address: "", city: "" } }), null);
  assert.ok(!bad.ok && bad.code === "validation");
  if (!bad.ok && bad.code === "validation") assert.equal(Object.keys(bad.fieldErrors).length, 5);
  assert.ok(!(await placeOrder(d, body({ items: [] }), null)).ok);
  assert.ok(!(await placeOrder(d, body({ idempotencyKey: "x" }), null)).ok);
  assert.ok(!(await placeOrder(d, null, null)).ok);
  assert.ok(!(await placeOrder(d, body({ website: "http://spam.example" }), null)).ok);
  assert.equal(calls.createOrder, 0);
});

test("a failed confirmation email does not fail or repeat the order, and is not reported as sent", async () => {
  for (const failing of [async () => ({ ok: false }), async () => { throw new Error("email provider down"); }]) {
    const { d, calls } = deps({ sendEmail: failing });
    const r = await placeOrder(d, body(), null);
    assert.ok(r.ok);
    if (r.ok) assert.equal(r.emailSent, false);
    assert.equal(calls.createOrder, 1);
    assert.equal(calls.markEmailSent, 0);
    assert.ok(calls.logs.some((l) => l.startsWith("confirmation_email")));
  }
});

test("a replayed submission returns the same order and does not email twice if already sent", async () => {
  const { d, calls } = deps({ createOrder: async () => created({ duplicate: true, emailSent: true }) });
  const r = await placeOrder(d, body(), null);
  assert.ok(r.ok);
  if (r.ok) { assert.equal(r.duplicate, true); assert.equal(r.emailSent, true); }
  assert.equal(calls.sendEmail, 0);
});

test("a replay of an order whose email failed earlier retries the email", async () => {
  const { d, calls } = deps({ createOrder: async () => created({ duplicate: true, emailSent: false }) });
  const r = await placeOrder(d, body(), null);
  assert.ok(r.ok && r.emailSent);
  assert.equal(calls.sendEmail, 1);
});

test("database failures return a generic message, never the raw error", async () => {
  const { d, calls } = deps({ createOrder: async () => { throw new Error("connection to 10.0.0.5 refused: password=hunter2"); } });
  const r = await placeOrder(d, body(), null);
  assert.ok(!r.ok && r.code === "server");
  assert.ok(!JSON.stringify(r).includes("hunter2") && !JSON.stringify(r).includes("10.0.0.5"));
  assert.equal(calls.sendEmail, 0);
});

test("stock, availability and price problems become actionable cart errors", async () => {
  const out = (o: Record<string, unknown>) => deps({ createOrder: async () => ({ kind: "rejected", ...o }) as CreateOrderOutcome });
  const stock = await placeOrder(out({ error: "insufficient_stock", name: "Agege Loaf", available: 1, productId }).d, body(), null);
  assert.ok(!stock.ok && stock.code === "cart" && stock.reason === "insufficient_stock");
  if (!stock.ok) assert.match(stock.message, /Only 1 of Agege Loaf/);
  const sold = await placeOrder(out({ error: "insufficient_stock", name: "Agege Loaf", available: 0, productId }).d, body(), null);
  if (!sold.ok) assert.match(sold.message, /sold out/);
  const price = await placeOrder(out({ error: "price_changed", lines: [{ productId, price: 2500, stock: 5 }] }).d, body(), null);
  assert.ok(!price.ok && price.code === "cart" && price.reason === "price_changed");
  if (!price.ok && price.code === "cart") assert.equal(price.lines?.[0].price, 2500);
  const gone = await placeOrder(out({ error: "product_not_found", productId }).d, body(), null);
  assert.ok(!gone.ok && gone.code === "cart" && gone.reason === "unavailable");
});
