import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation/checkout";

export type OrderSummary = { id: string; orderNumber: string; total: number; status: string; createdAt: string };
export type OrderDetail = OrderSummary & {
  subtotal: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  items: { id: string; name: string; price: number; quantity: number }[];
};

type SummaryRow = { id: string; order_number: string; total: number | string; status: string; created_at: string };

const toSummary = (r: SummaryRow): OrderSummary => ({
  id: r.id, orderNumber: r.order_number, total: Number(r.total), status: r.status, createdAt: r.created_at,
});

/*
 * These queries use the visitor's own session (anon key + their JWT), so Row Level Security
 * guarantees they can only ever read their own orders, even if this code had a bug.
 */
export async function getMyOrders(limit = 100): Promise<OrderSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders").select("id, order_number, total, status, created_at")
    .order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("[orders] list failed", error.code, error.message);
    throw new Error("Orders unavailable");
  }
  return (data as SummaryRow[]).map(toSummary);
}

export async function getMyOrderCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return 0;
  const { count, error } = await supabase.from("orders").select("id", { count: "exact", head: true });
  if (error) {
    console.error("[orders] count failed", error.code, error.message);
    throw new Error("Orders unavailable");
  }
  return count ?? 0;
}

export async function getMyOrder(orderId: string): Promise<OrderDetail | null> {
  if (!isUuid(orderId)) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, subtotal, total, status, created_at, customer_name, customer_email, phone, address, city, order_items(id, product_name_snapshot, price_snapshot, quantity)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) {
    console.error("[orders] detail failed", error.code, error.message);
    throw new Error("Order unavailable");
  }
  if (!data) return null;
  const row = data as unknown as SummaryRow & {
    subtotal: number | string; customer_name: string; customer_email: string; phone: string; address: string; city: string;
    order_items: { id: string; product_name_snapshot: string; price_snapshot: number | string; quantity: number }[];
  };
  return {
    ...toSummary(row),
    subtotal: Number(row.subtotal),
    customerName: row.customer_name, customerEmail: row.customer_email, phone: row.phone, address: row.address, city: row.city,
    items: row.order_items.map((i) => ({ id: i.id, name: i.product_name_snapshot, price: Number(i.price_snapshot), quantity: i.quantity })),
  };
}
