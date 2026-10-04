import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { AccountNav } from "@/components/account/account-nav";
import { OrdersList } from "@/components/account/orders-table";
import { ButtonLink } from "@/components/ui/button";
import { displayName, requireUser } from "@/lib/auth/session";
import { getMyOrderCount, getMyOrders } from "@/lib/orders/queries";

// Depends on the visitor's session cookie, so it must never be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const [orders, count] = await Promise.all([getMyOrders(5), getMyOrderCount()]);
  const name = displayName(user);
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Container className="space-y-10 py-10 sm:py-16">
      <h1 className="text-headline">Your account</h1>
      <AccountNav current="overview" />

      <section aria-labelledby="profile-title" className="flex items-center gap-5">
        <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent font-display text-title text-on-accent">{initials}</div>
        <div className="min-w-0">
          <h2 id="profile-title" className="font-display text-title">{name}</h2>
          <p className="truncate text-muted">{user.email}</p>
          <p className="text-caption text-muted">Signed in with Google</p>
        </div>
      </section>

      <section aria-labelledby="orders-title" className="space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="orders-title" className="font-display text-title">Recent orders</h2>
          <p className="text-muted">{count} {count === 1 ? "order" : "orders"} in total</p>
        </div>
        {orders.length > 0 ? (
          <>
            <OrdersList orders={orders} />
            {count > orders.length && <Link href="/account/orders" className="inline-block font-medium underline underline-offset-4 decoration-accent decoration-2">View all orders</Link>}
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-muted">You haven&rsquo;t placed an order yet.</p>
            <ButtonLink href="/shop">Shop the bakery</ButtonLink>
          </div>
        )}
      </section>
    </Container>
  );
}
