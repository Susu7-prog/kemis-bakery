import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { AccountNav } from "@/components/account/account-nav";
import { OrdersList } from "@/components/account/orders-table";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { getMyOrders } from "@/lib/orders/queries";

// Depends on the visitor's session cookie, so it must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your orders", robots: { index: false, follow: false } };

export default async function OrdersPage() {
  await requireUser("/account/orders");
  const orders = await getMyOrders();

  return (
    <Container className="space-y-10 py-10 sm:py-16">
      <h1 className="text-headline">Your orders</h1>
      <AccountNav current="orders" />
      {orders.length > 0 ? (
        <OrdersList orders={orders} />
      ) : (
        <div className="max-w-md space-y-4">
          <p className="font-display text-title">No orders yet.</p>
          <p className="text-muted">When you place an order while signed in, it will appear here.</p>
          <ButtonLink href="/shop">Shop the bakery</ButtonLink>
        </div>
      )}
    </Container>
  );
}
