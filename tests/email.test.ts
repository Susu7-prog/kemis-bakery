import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOrderConfirmation } from "../lib/email/order-confirmation.ts";
import { createMailgunSender } from "../lib/email/mailgun-client.ts";

const order = {
  orderNumber: "KEMI-10001", customerName: "<script>alert(1)</script>Amaka Obi", createdAt: "2026-10-03T12:00:00Z",
  items: [{ name: "Agege Loaf", price: 2200, quantity: 2 }, { name: "Chin Chin & Co", price: 4200, quantity: 1 }], subtotal: 8600, total: 8600,
};
const msg = { to: "amaka@example.com", subject: "Hi", html: "<p>Hi</p>", text: "Hi" };
const config = { apiKey: "key-SECRET", domain: "mg.example.com", from: "Kemi's <orders@mg.example.com>" };

test("confirmation email has HTML and plain-text versions with all order details", () => {
  const { subject, html, text } = buildOrderConfirmation(order);
  assert.match(subject, /KEMI-10001/);
  for (const part of [html, text]) {
    for (const needle of ["KEMI-10001", "Agege Loaf", "Chin Chin", "₦4,400", "₦8,600"]) assert.ok(part.includes(needle) || part.includes(needle.replace("&", "&amp;")), needle);
  }
  assert.match(html, /Kemi&rsquo;s/);
  assert.match(text, /Subtotal/);
  assert.match(text, /Total: ₦8,600/);
});

test("confirmation email escapes customer-supplied text", () => {
  const { html } = buildOrderConfirmation(order);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Chin Chin &amp; Co"));
});

test("Mailgun sender posts form-encoded mail with basic auth to the right URL", async () => {
  let call: { url: string; init: RequestInit } | undefined;
  const send = createMailgunSender(config, (async (url: string, init: RequestInit) => { call = { url, init }; return new Response(JSON.stringify({ id: "<abc@mg>" }), { status: 200 }); }) as unknown as typeof fetch);
  const result = await send(msg);
  assert.deepEqual(result, { ok: true, id: "<abc@mg>" });
  assert.equal(call?.url, "https://api.mailgun.net/v3/mg.example.com/messages");
  assert.equal((call?.init.headers as Record<string, string>).Authorization, `Basic ${Buffer.from("api:key-SECRET").toString("base64")}`);
  const body = call?.init.body as URLSearchParams;
  assert.equal(body.get("to"), "amaka@example.com");
  assert.equal(body.get("html"), "<p>Hi</p>");
  assert.equal(body.get("text"), "Hi");
});

test("Mailgun errors are reported as failures and never leak the key", async () => {
  const rejected = await createMailgunSender(config, (async () => new Response("Forbidden", { status: 401 })) as unknown as typeof fetch)(msg);
  assert.deepEqual(rejected, { ok: false, reason: "rejected", status: 401 });
  const network = await createMailgunSender(config, (async () => { throw new Error("ECONNRESET key-SECRET"); }) as unknown as typeof fetch)(msg);
  assert.deepEqual(network, { ok: false, reason: "network" });
  assert.ok(!JSON.stringify([rejected, network]).includes("SECRET"));
  assert.deepEqual(await createMailgunSender(null)(msg), { ok: false, reason: "not_configured" });
  assert.deepEqual(await createMailgunSender(config, (async () => { throw new Error("must not be called"); }) as unknown as typeof fetch)({ ...msg, to: "a@b.co\r\nBcc: evil@x.co" }), { ok: false, reason: "invalid" });
});

test("Mailgun supports the EU base URL", async () => {
  let url = "";
  await createMailgunSender({ ...config, baseUrl: "https://api.eu.mailgun.net/" }, (async (u: string) => { url = u; return new Response("{}", { status: 200 }); }) as unknown as typeof fetch)(msg);
  assert.equal(url, "https://api.eu.mailgun.net/v3/mg.example.com/messages");
});
