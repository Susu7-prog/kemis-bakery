-- Atomic, server-only order creation.
--
-- The application calls this with the service-role key. It re-reads every price and stock level
-- from the database (nothing from the browser is trusted except product ids and quantities),
-- computes totals, rejects overselling, and writes the order, its items and the stock change in
-- one transaction. A repeated idempotency key returns the original order instead of a new one.

alter table public.orders
  add column access_token text not null default replace(gen_random_uuid()::text, '-', ''),
  add column confirmation_email_sent_at timestamptz;

create or replace function public.create_order(
  p_idempotency_key   text,
  p_user_id           uuid,
  p_customer_name     text,
  p_customer_email    text,
  p_phone             text,
  p_address           text,
  p_city              text,
  p_items             jsonb,
  p_expected_subtotal numeric default null
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_order     public.orders;
  v_line      record;
  v_lines     jsonb := '[]'::jsonb;
  v_subtotal  numeric(12, 2) := 0;
  v_expected  integer;
  v_found     integer := 0;
  v_missing   uuid;
begin
  if p_idempotency_key is null or char_length(p_idempotency_key) < 8 then
    return jsonb_build_object('ok', false, 'error', 'invalid_request');
  end if;

  -- Replay: the same checkout attempt returns the order that already exists.
  select * into v_order from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'ok', true, 'duplicate', true,
      'order_id', v_order.id, 'order_number', v_order.order_number,
      'access_token', v_order.access_token,
      'customer_name', v_order.customer_name, 'customer_email', v_order.customer_email,
      'subtotal', v_order.subtotal, 'total', v_order.total, 'created_at', v_order.created_at,
      'email_sent', v_order.confirmation_email_sent_at is not null,
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'name', oi.product_name_snapshot, 'price', oi.price_snapshot, 'quantity', oi.quantity
        ) order by oi.created_at, oi.product_name_snapshot)
        from public.order_items oi where oi.order_id = v_order.id
      ), '[]'::jsonb)
    );
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    return jsonb_build_object('ok', false, 'error', 'invalid_items');
  end if;

  select count(distinct (i ->> 'product_id')::uuid) into v_expected
  from jsonb_array_elements(p_items) i;

  -- Lock the product rows in a stable order so concurrent orders cannot oversell or deadlock.
  for v_line in
    select p.id, p.name, p.price, p.stock, l.quantity
    from (
      select (i ->> 'product_id')::uuid as product_id, sum((i ->> 'quantity')::integer) as quantity
      from jsonb_array_elements(p_items) i
      group by 1
    ) l
    join public.products p on p.id = l.product_id
    order by p.id
    for update of p
  loop
    v_found := v_found + 1;
    if v_line.quantity < 1 or v_line.quantity > 20 then
      return jsonb_build_object('ok', false, 'error', 'invalid_quantity', 'product_id', v_line.id);
    end if;
    if v_line.stock < v_line.quantity then
      return jsonb_build_object(
        'ok', false, 'error', 'insufficient_stock',
        'product_id', v_line.id, 'name', v_line.name, 'available', v_line.stock
      );
    end if;
    v_subtotal := v_subtotal + v_line.price * v_line.quantity;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_line.id, 'name', v_line.name, 'price', v_line.price, 'quantity', v_line.quantity
    );
  end loop;

  if v_found < v_expected then
    select (i ->> 'product_id')::uuid into v_missing
    from jsonb_array_elements(p_items) i
    where not exists (select 1 from public.products p where p.id = (i ->> 'product_id')::uuid)
    limit 1;
    return jsonb_build_object('ok', false, 'error', 'product_not_found', 'product_id', v_missing);
  end if;

  if p_expected_subtotal is not null and p_expected_subtotal <> v_subtotal then
    return jsonb_build_object(
      'ok', false, 'error', 'price_changed', 'subtotal', v_subtotal,
      'lines', (
        select jsonb_agg(jsonb_build_object('product_id', p.id, 'price', p.price, 'stock', p.stock))
        from public.products p
        where p.id in (select (i ->> 'product_id')::uuid from jsonb_array_elements(p_items) i)
      )
    );
  end if;

  begin
    insert into public.orders (
      user_id, customer_name, customer_email, phone, address, city, subtotal, total, idempotency_key
    ) values (
      p_user_id, p_customer_name, p_customer_email, p_phone, p_address, p_city,
      v_subtotal, v_subtotal, p_idempotency_key
    ) returning * into v_order;
  exception when unique_violation then
    -- A concurrent request with the same key won the race; return its order.
    select * into v_order from public.orders where idempotency_key = p_idempotency_key;
    return jsonb_build_object(
      'ok', true, 'duplicate', true,
      'order_id', v_order.id, 'order_number', v_order.order_number,
      'access_token', v_order.access_token,
      'customer_name', v_order.customer_name, 'customer_email', v_order.customer_email,
      'subtotal', v_order.subtotal, 'total', v_order.total, 'created_at', v_order.created_at,
      'email_sent', v_order.confirmation_email_sent_at is not null,
      'items', coalesce((
        select jsonb_agg(jsonb_build_object(
          'name', oi.product_name_snapshot, 'price', oi.price_snapshot, 'quantity', oi.quantity
        ) order by oi.created_at, oi.product_name_snapshot)
        from public.order_items oi where oi.order_id = v_order.id
      ), '[]'::jsonb)
    );
  end;

  insert into public.order_items (order_id, product_id, product_name_snapshot, price_snapshot, quantity)
  select v_order.id, (l ->> 'product_id')::uuid, l ->> 'name', (l ->> 'price')::numeric, (l ->> 'quantity')::integer
  from jsonb_array_elements(v_lines) l;

  update public.products p
  set stock = p.stock - (l ->> 'quantity')::integer
  from jsonb_array_elements(v_lines) l
  where p.id = (l ->> 'product_id')::uuid;

  return jsonb_build_object(
    'ok', true, 'duplicate', false,
    'order_id', v_order.id, 'order_number', v_order.order_number,
    'access_token', v_order.access_token,
    'customer_name', v_order.customer_name, 'customer_email', v_order.customer_email,
    'subtotal', v_order.subtotal, 'total', v_order.total, 'created_at', v_order.created_at,
    'email_sent', false,
    'items', (
      select jsonb_agg(jsonb_build_object('name', l ->> 'name', 'price', (l ->> 'price')::numeric, 'quantity', (l ->> 'quantity')::integer))
      from jsonb_array_elements(v_lines) l
    )
  );
exception
  when invalid_text_representation or numeric_value_out_of_range or invalid_parameter_value then
    return jsonb_build_object('ok', false, 'error', 'invalid_items');
end;
$$;

-- Only the server (service role) may create orders.
revoke all on function public.create_order(text, uuid, text, text, text, text, text, jsonb, numeric) from public, anon, authenticated;
grant execute on function public.create_order(text, uuid, text, text, text, text, text, jsonb, numeric) to service_role;
