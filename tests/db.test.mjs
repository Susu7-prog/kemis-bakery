// Database tests: migrations, seed, constraints, Row Level Security and create_order().
// Runs the real SQL in an in-process Postgres (PGlite). Run with: npm run test:db
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const root = new URL("../supabase/", import.meta.url);
const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
let db, loaf, pie, soldOut;

const order = (key, items, extra = {}) => db.query(
  `select public.create_order($1, $2, 'Amaka Obi', 'amaka@example.com', '+2348031234567', '12 Admiralty Way', 'Lagos', $3::jsonb, $4) as r`,
  [key, extra.user ?? null, JSON.stringify(items), extra.expected ?? null],
).then((res) => res.rows[0].r);

async function as(role, sub, sql, params) {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.sub', $1, false)", [sub ?? ""]);
  try { return await db.query(sql, params); } finally { await db.exec("reset role"); }
}
const rejects = (promise, pattern) => assert.rejects(promise, pattern);

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to service_role;
    alter default privileges in schema public grant all on sequences to service_role;
  `);
  for (const file of readdirSync(new URL("migrations", root)).sort()) await db.exec(readFileSync(new URL(`migrations/${file}`, root), "utf8"));
  await db.exec(readFileSync(new URL("seed.sql", root), "utf8"));
  await db.exec(`insert into auth.users values ('${A}'), ('${B}')`);
  const get = async (slug) => (await db.query("select id, price, stock from public.products where slug = $1", [slug])).rows[0];
  loaf = await get("agege-loaf"); pie = await get("meat-pie-box"); soldOut = await get("coconut-lime-cake");
});

test("seed loads 16 products and can be re-run", async () => {
  await db.exec(readFileSync(new URL("seed.sql", root), "utf8"));
  assert.equal((await db.query("select count(*)::int n from public.products")).rows[0].n, 16);
});

test("create_order: totals and prices come from the database, stock is decremented", async () => {
  const stockBefore = loaf.stock;
  const r = await order("key-happy-0001", [{ product_id: loaf.id, quantity: 2 }, { product_id: pie.id, quantity: 1 }], { user: A });
  assert.equal(r.ok, true);
  assert.equal(r.duplicate, false);
  assert.equal(Number(r.subtotal), 2200 * 2 + 5400);
  assert.equal(Number(r.total), 9800);
  assert.match(r.order_number, /^KEMI-\d{5}$/);
  assert.equal(r.items.length, 2);
  assert.equal((await db.query("select stock from public.products where id=$1", [loaf.id])).rows[0].stock, stockBefore - 2);
  const row = (await db.query("select user_id, status from public.orders where id=$1", [r.order_id])).rows[0];
  assert.equal(row.user_id, A);
  assert.equal(row.status, "pending");
});

test("create_order: the same idempotency key returns the original order and does not oversell", async () => {
  const stock = (await db.query("select stock from public.products where id=$1", [pie.id])).rows[0].stock;
  const first = await order("key-dup-00001", [{ product_id: pie.id, quantity: 1 }]);
  const second = await order("key-dup-00001", [{ product_id: pie.id, quantity: 1 }]);
  const third = await order("key-dup-00001", [{ product_id: pie.id, quantity: 5 }]);
  assert.equal(second.duplicate, true);
  assert.equal(second.order_number, first.order_number);
  assert.equal(third.order_number, first.order_number);
  assert.equal(second.items[0].name, "Beef Meat Pie, Box of 6");
  assert.equal((await db.query("select count(*)::int n from public.orders where idempotency_key='key-dup-00001'")).rows[0].n, 1);
  assert.equal((await db.query("select stock from public.products where id=$1", [pie.id])).rows[0].stock, stock - 1);
});

test("create_order: concurrent submissions with one key create exactly one order", async () => {
  const results = await Promise.all(Array.from({ length: 4 }, () => order("key-race-0001", [{ product_id: loaf.id, quantity: 1 }])));
  assert.equal(new Set(results.map((r) => r.order_number)).size, 1);
  assert.equal((await db.query("select count(*)::int n from public.orders where idempotency_key='key-race-0001'")).rows[0].n, 1);
});

test("create_order: duplicate lines for one product are merged", async () => {
  const r = await order("key-merge-001", [{ product_id: loaf.id, quantity: 1 }, { product_id: loaf.id, quantity: 2 }]);
  assert.equal(r.ok, true);
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].quantity, 3);
  assert.equal(Number(r.total), 6600);
});

test("create_order: rejects overselling and sold-out products with the available quantity", async () => {
  const sold = await order("key-sold-0001", [{ product_id: soldOut.id, quantity: 1 }]);
  assert.deepEqual([sold.ok, sold.error, sold.available], [false, "insufficient_stock", 0]);
  const tooMany = await order("key-many-0001", [{ product_id: loaf.id, quantity: 20 }, { product_id: (await db.query("select id from public.products where slug='honey-wheat-loaf'")).rows[0].id, quantity: 9 }]);
  assert.equal(tooMany.error, "insufficient_stock");
  assert.equal((await db.query("select count(*)::int n from public.orders where idempotency_key in ('key-sold-0001','key-many-0001')")).rows[0].n, 0);
});

test("create_order: rejects unknown products, bad quantities and malformed items", async () => {
  assert.equal((await order("key-nope-0001", [{ product_id: "99999999-9999-4999-8999-999999999999", quantity: 1 }])).error, "product_not_found");
  assert.equal((await order("key-q0-000001", [{ product_id: loaf.id, quantity: 0 }])).error, "invalid_quantity");
  assert.equal((await order("key-q99-00001", [{ product_id: loaf.id, quantity: 99 }])).error, "invalid_quantity");
  assert.equal((await order("key-empty-001", [])).error, "invalid_items");
  assert.equal((await order("key-bad-00001", [{ product_id: "not-a-uuid", quantity: 1 }])).error, "invalid_items");
  assert.equal((await order("key-bad-00002", [{ product_id: loaf.id, quantity: "lots" }])).error, "invalid_items");
  assert.equal((await db.query("select count(*)::int n from public.orders where idempotency_key like 'key-bad-%' or idempotency_key like 'key-q%'")).rows[0].n, 0);
});

test("create_order: a stale client price is detected and the order is not created", async () => {
  const r = await order("key-price-0001", [{ product_id: loaf.id, quantity: 1 }], { expected: 1 });
  assert.equal(r.error, "price_changed");
  assert.equal(Number(r.subtotal), 2200);
  assert.equal(r.lines[0].price, 2200);
  const ok = await order("key-price-0002", [{ product_id: loaf.id, quantity: 1 }], { expected: 2200 });
  assert.equal(ok.ok, true);
});

test("create_order: tampered prices cannot change what is charged", async () => {
  const r = await order("key-tamper-001", [{ product_id: loaf.id, quantity: 1, price: 1 }]);
  assert.equal(Number(r.total), 2200);
});

test("create_order can only be executed by the service role", async () => {
  for (const role of ["anon", "authenticated"]) {
    await rejects(as(role, A, "select public.create_order('key-role-0001', null, 'x', 'x@x.co', '0803123', 'a', 'c', '[]'::jsonb, null)"), /permission denied/);
  }
  const viaService = await as("service_role", null, "select public.create_order('key-role-0002', null, 'x', 'x@x.co', '+2348031234567', 'a', 'c', $1::jsonb, null) as r", [JSON.stringify([{ product_id: loaf.id, quantity: 1 }])]);
  assert.equal(viaService.rows[0].r.ok, true, JSON.stringify(viaService.rows[0].r));
});

test("constraints reject invalid data", async () => {
  await rejects(db.exec("update public.products set price = -1 where slug='agege-loaf'"), /products_price_check/);
  await rejects(db.exec("update public.products set stock = -1 where slug='agege-loaf'"), /products_stock_check/);
  await rejects(db.exec("insert into public.products (name, slug, price, image_url, category) values ('x','Bad Slug',1,'/x.svg','breads')"), /products_slug_check/);
  await rejects(db.exec("insert into public.orders (customer_name, customer_email, phone, address, city, subtotal, total) values ('x','x@x.co','0803123','a','c',10,5)"), /orders_check/);
  await rejects(db.exec("update public.orders set status='shipped-ish'"), /orders_status_check/);
});

test("Row Level Security: customers see only their own orders and items", async () => {
  const mine = await order("key-rls-a-0001", [{ product_id: loaf.id, quantity: 1 }], { user: A });
  const theirs = await order("key-rls-b-0001", [{ product_id: loaf.id, quantity: 1 }], { user: B });
  const guest = await order("key-rls-g-0001", [{ product_id: loaf.id, quantity: 1 }]);

  const aOrders = (await as("authenticated", A, "select id from public.orders")).rows.map((r) => r.id);
  assert.ok(aOrders.includes(mine.order_id));
  assert.ok(!aOrders.includes(theirs.order_id));
  assert.ok(!aOrders.includes(guest.order_id));
  const aItems = (await as("authenticated", A, "select order_id from public.order_items")).rows;
  assert.ok(aItems.every((i) => aOrders.includes(i.order_id)));
  assert.equal((await as("authenticated", A, "select 1 from public.orders where id=$1", [theirs.order_id])).rows.length, 0);
  assert.equal((await as("authenticated", B, "select 1 from public.orders where id=$1", [guest.order_id])).rows.length, 0);
});

test("Row Level Security: anonymous visitors read the catalogue only; nobody can write from the client", async () => {
  assert.equal((await as("anon", null, "select count(*)::int n from public.products")).rows[0].n, 16);
  await rejects(as("anon", null, "select * from public.orders"), /permission denied/);
  await rejects(as("anon", null, "select * from public.order_items"), /permission denied/);
  for (const sql of [
    "insert into public.orders (customer_name, customer_email, phone, address, city, subtotal, total) values ('x','x@x.co','0803123','a','c',1,1)",
    "update public.orders set status='completed'",
    "delete from public.order_items",
    "update public.products set price = 1",
  ]) await rejects(as("authenticated", A, sql), /permission denied/);
  await rejects(as("anon", null, "insert into public.products (name, slug, price, image_url, category) values ('x','x',1,'/x.svg','breads')"), /permission denied/);
  assert.equal(Number((await db.query("select price from public.products where slug='agege-loaf'")).rows[0].price), 2200);
});
