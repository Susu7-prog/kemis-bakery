import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../lib/auth/redirect.ts";
import { NEXT_COOKIE } from "../lib/auth/next-cookie.ts";

test("the post-login destination cookie is sanitised the same way as a query parameter", () => {
  assert.equal(NEXT_COOKIE, "kemis_auth_next");
  assert.equal(safeNextPath(decodeURIComponent(encodeURIComponent("/account/orders"))), "/account/orders");
  assert.equal(safeNextPath(decodeURIComponent(encodeURIComponent("https://evil.example"))), "/account");
});
