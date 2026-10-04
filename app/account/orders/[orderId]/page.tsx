import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { AccountNav } from "@/components/account/account-nav";
import { requireUser } from "@/lib/auth/session";
import { formatDate, formatPrice } from "@/lib/format";
import { getMyOrder } from "@/lib/orders/queries";
import { orderStatusLabel } from "@/lib/orders/status";

export const metadata: Metadata = { title: "Order details", robots: { index: false, follow: false } };

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  await requireUser(`/account/orders/${orderId}`);
  // Row Level Security means another customer's order id simply returns nothing here.
  const order = await getMyOrder(orderId);
  if (!order) notFound();

  return (
    <Container className="space-y-10 py-10 sm:py-16">
      <div>
        <Link href="/account/orders" className="text-caption text-muted underline underline-offset-4 hover:text-ink">&larr; All orders</Link>
        <h1 className="mt-3 text-headline">{order.orderNumber}</h1>
        <p className="mt-2 text-muted">Placed {formatDate(order.createdAt)}</p>
      </div>
      <AccountNav current="orders" />

      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="items-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="items-title" className="font-display text-title">Items</h2>
            <span className="rounded-sm bg-accent-soft px-2 py-0.5 text-caption font-medium">{orderStatusLabel(order.status)}</span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-caption text-muted">{item.quantity} &times; {formatPrice(item.price)}</p>
                </div>
                <p className="shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between font-display text-title"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>

        <section aria-labelledby="customer-title">
          <h2 id="customer-title" className="font-display text-title">Delivery details</h2>
          <dl className="mt-4 space-y-3">
            {[["Name", order.customerName], ["Email", order.customerEmail], ["Phone", order.phone], ["Address", order.address], ["City", order.city]].map(([label, value]) => (
              <div key={label}><dt className="text-caption text-muted">{label}</dt><dd className="break-words">{value}</dd></div>
            ))}
          </dl>
        </section>
      </div>
    </Container>
  );
}
