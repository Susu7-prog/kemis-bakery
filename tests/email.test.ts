import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOrderConfirmation } from "../lib/email/order-confirmation.ts";
import { createResendSender } from "../lib/email/resend-client.ts";

const order = {
  orderNumber: "KEMI-10001", customerName: "<script>alert(1)</script>Amaka Obi", customerEmail: "amaka@example.com",
  phone: "+2348031234567", address: "12 Admiralty Way, Lekki", city: "Lagos", createdAt: "2026-10-03T12:00:00Z",
  items: [{ name: "Agege Loaf", price: 2200, quantity: 2 }, { name: "Chin Chin & Co", price: 4200, quantity: 1 }], subtotal: 8600, total: 8600,
};
const msg = { to: "amaka@example.com", subject: "Hi", html: "<p>Hi</p>", text: "Hi" };
const config = { apiKey: "re_SECRET_KEY", from: "Kemi's <orders@kemis.example>" };

test("confirmation email has HTML and plain-text versions with every required detail", () => {
  const { subject, html, text } = buildOrderConfirmation(order);
  assert.match(subject, /KEMI-10001/);
  for (const part of [html, text]) {
    for (const needle of ["KEMI-10001", "Agege Loaf", "₦4,400", "₦8,600", "amaka@example.com", "+2348031234567", "12 Admiralty Way, Lekki, Lagos", "October 2026"]) {
      assert.ok(part.includes(needle), `missing ${needle}`);
    }
    assert.ok(part.includes("Chin Chin &amp; Co") || part.includes("Chin Chin & Co"));
  }
  assert.match(html, /Kemi&rsquo;s/);
  assert.match(html, /viewport/);
  assert.match(text, /Subtotal: ₦8,600/);
  assert.match(text, /Total: ₦8,600/);
  assert.match(text, /confirm payment and delivery/);
});

test("confirmation email shows the contact address only when one is configured, and has no placeholders", () => {
  assert.match(buildOrderConfirmation(order).text, /Just reply to this email/);
  const withContact = buildOrderConfirmation({ ...order, contactEmail: "hello@kemis.example" });
  assert.match(withContact.text, /hello@kemis\.example/);
  for (const part of [withContact.html, withContact.text]) assert.ok(!/lorem|todo|xxx|\{\{|undefined|null/i.test(part));
  assert.ok(!/href=/.test(withContact.html), "no links, so none can be broken");
});

test("confirmation email escapes customer-supplied text", () => {
  const { html } = buildOrderConfirmation({ ...order, address: `5 "Quote" <b>Street</b>` });
  assert.ok(!html.includes("<script>") && !html.includes("<b>Street"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("&lt;b&gt;Street&lt;/b&gt;"));
});

test("Resend sender posts JSON with a Bearer token to the right URL", async () => {
  let call: { url: string; init: RequestInit } | undefined;
  const send = createResendSender({ ...config, replyTo: "hello@kemis.example" }, (async (url: string, init: RequestInit) => { call = { url, init }; return new Response(JSON.stringify({ id: "re_abc123" }), { status: 200 }); }) as unknown as typeof fetch);
  const result = await send({ ...msg, idempotencyKey: "order-confirmation-o1" });
  assert.deepEqual(result, { ok: true, id: "re_abc123" });
  assert.equal(call?.url, "https://api.resend.com/emails");
  const headers = call?.init.headers as Record<string, string>;
  assert.equal(headers.Authorization, "Bearer re_SECRET_KEY");
  assert.equal(headers["Idempotency-Key"], "order-confirmation-o1");
  const body = JSON.parse(String(call?.init.body));
  assert.deepEqual(body, { from: config.from, to: ["amaka@example.com"], subject: "Hi", html: "<p>Hi</p>", text: "Hi", reply_to: "hello@kemis.example" });
});

test("Resend errors are reported as failures and never leak the key or recipient", async () => {
  const rejected = await createResendSender(config, (async () => new Response(JSON.stringify({ name: "validation_error", message: "The from address is not verified for amaka@example.com" }), { status: 403 })) as unknown as typeof fetch)(msg);
  assert.deepEqual(rejected, { ok: false, reason: "rejected", status: 403, detail: "validation_error" });
  const network = await createResendSender(config, (async () => { throw new Error("ECONNRESET re_SECRET_KEY"); }) as unknown as typeof fetch)(msg);
  assert.deepEqual(network, { ok: false, reason: "network" });
  assert.ok(!JSON.stringify([rejected, network]).includes("SECRET"));
  assert.ok(!JSON.stringify(rejected).includes("amaka"));
  assert.deepEqual(await createResendSender(null)(msg), { ok: false, reason: "not_configured" });
  assert.deepEqual(await createResendSender(config, (async () => { throw new Error("must not be called"); }) as unknown as typeof fetch)({ ...msg, to: "a@b.co\r\nBcc: evil@x.co" }), { ok: false, reason: "invalid" });
});
