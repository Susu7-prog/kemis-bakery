import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, validateCheckoutFields, validateOrderItems, isValidIdempotencyKey } from "../lib/validation/checkout.ts";
import { safeNextPath } from "../lib/auth/redirect.ts";

const good = { fullName: "  Amaka   Obi ", email: " Amaka@Example.COM ", phone: "0803 123 4567", address: "12 Admiralty Way, Lekki", city: "Lagos" };
const id = "dd132556-de18-54e0-b4fe-060152fcddba";

test("valid checkout fields are trimmed and normalised", () => {
  const r = validateCheckoutFields(good);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.data, { fullName: "Amaka Obi", email: "amaka@example.com", phone: "+2348031234567", address: "12 Admiralty Way, Lekki", city: "Lagos" });
});

test("every missing or invalid field reports an error", () => {
  const r = validateCheckoutFields({ fullName: "", email: "nope", phone: "123", address: "x", city: "" });
  assert.ok(!r.ok);
  if (!r.ok) assert.deepEqual(Object.keys(r.errors).sort(), ["address", "city", "email", "fullName", "phone"]);
  assert.ok(!validateCheckoutFields(null).ok);
  assert.ok(!validateCheckoutFields({ ...good, fullName: "x".repeat(121) }).ok);
  assert.ok(!validateCheckoutFields({ ...good, email: "a@b" }).ok);
  assert.ok(!validateCheckoutFields({ ...good, address: "y".repeat(301) }).ok);
  assert.ok(!validateCheckoutFields({ ...good, fullName: 42 }).ok);
});

test("phone numbers: Nigerian local, +234 and international formats", () => {
  assert.equal(normalizePhone("08031234567"), "+2348031234567");
  assert.equal(normalizePhone("+234 803 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("2348031234567"), "+2348031234567");
  assert.equal(normalizePhone("+44 7700 900123"), "+447700900123");
  assert.equal(normalizePhone("0603123456"), null);
  assert.equal(normalizePhone("abc"), null);
  assert.equal(normalizePhone(""), null);
});

test("order items: ids and quantities are strictly validated", () => {
  assert.deepEqual(validateOrderItems([{ productId: id, quantity: 2 }]), { ok: true, items: [{ productId: id, quantity: 2 }] });
  for (const bad of [
    [], null, "x", {}, [{ productId: id, quantity: 0 }], [{ productId: id, quantity: 21 }], [{ productId: id, quantity: 1.5 }],
    [{ productId: id, quantity: "2" }], [{ productId: "nope", quantity: 1 }], [null], [{ quantity: 1 }],
    Array.from({ length: 51 }, () => ({ productId: id, quantity: 1 })),
  ]) assert.equal(validateOrderItems(bad).ok, false, JSON.stringify(bad));
});

test("idempotency keys", () => {
  assert.ok(isValidIdempotencyKey("3f2b9c1e-7a4d-4e8b-9a61-0c5d2e8f1a77"));
  assert.ok(!isValidIdempotencyKey("short"));
  assert.ok(!isValidIdempotencyKey("has spaces in it here"));
  assert.ok(!isValidIdempotencyKey(undefined));
});

test("safeNextPath blocks open redirects", () => {
  assert.equal(safeNextPath("/account/orders"), "/account/orders");
  assert.equal(safeNextPath("/checkout?x=1"), "/checkout?x=1");
  for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "evil.com", "/ok\r\nSet-Cookie: x=1", "", null, undefined]) {
    assert.equal(safeNextPath(bad as string | null | undefined), "/account", String(bad));
  }
  assert.equal(safeNextPath("//evil.com", "/"), "/");
});
