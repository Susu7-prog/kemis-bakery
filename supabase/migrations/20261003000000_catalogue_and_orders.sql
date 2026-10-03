-- Kemi's Artisanal African Bakery & Spice Shop: catalogue and orders.
-- Orders are created server-side with the service-role key, never from the browser.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- products
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 200),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description  text not null default '',
  price        numeric(12, 2) not null check (price >= 0),
  image_url    text not null,
  gallery_urls text[] not null default '{}',
  category     text not null check (category in ('breads', 'pastries', 'cakes', 'spices')),
  stock        integer not null default 0 check (stock >= 0),
  badge        text check (badge in ('Bestseller', 'New')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_created_at_idx on public.products (created_at);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------ orders
-- Human-readable order numbers: KEMI-10001, KEMI-10002, ...
create sequence public.order_number_seq start with 10001;

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique default ('KEMI-' || nextval('public.order_number_seq')::text),
  user_id         uuid references auth.users (id) on delete set null,
  customer_name   text not null check (char_length(customer_name) between 1 and 120),
  customer_email  text not null check (char_length(customer_email) between 3 and 254),
  phone           text not null check (char_length(phone) between 5 and 30),
  address         text not null check (char_length(address) between 1 and 300),
  city            text not null check (char_length(city) between 1 and 100),
  subtotal        numeric(12, 2) not null check (subtotal >= 0),
  total           numeric(12, 2) not null check (total >= 0),
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled')),
  -- One key per checkout attempt. A repeated submission hits this constraint instead of creating a second order.
  idempotency_key text unique check (char_length(idempotency_key) between 8 and 100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (total >= subtotal)
);

create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_created_at_idx on public.orders (created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------- order_items
create table public.order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders (id) on delete cascade,
  product_id            uuid references public.products (id) on delete set null,
  product_name_snapshot text not null,
  price_snapshot        numeric(12, 2) not null check (price_snapshot >= 0),
  quantity              integer not null check (quantity between 1 and 100),
  created_at            timestamptz not null default now(),
  unique (order_id, product_id)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

-- ---------------------------------------------------- privileges and RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.products, public.orders, public.order_items from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.orders, public.order_items to authenticated;

-- Anyone may read the catalogue. Nobody but the service role may change it.
create policy "Catalogue is public"
  on public.products for select
  to anon, authenticated
  using (true);

-- Customers can read only their own orders. No insert/update/delete policies exist, so
-- writes are only possible with the service-role key, on the server.
create policy "Customers read own orders"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Customers read own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );
