import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForConfirmation } from "@/lib/orders/confirmation-access";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Order received", robots: { index: false, follow: false } };

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  if (!/^KEMI-\d{4,12}$/.test(orderNumber)) notFound();

  const user = await getCurrentUser();
  const order = await getOrderForConfirmation(orderNumber, user?.id ?? null);
  if (!order) notFound();

  const isOwner = user !== null && order.userId === user.id;

  return (
    <Container className="py-12 sm:py-20">
      <div className="mx-auto max-w-xl space-y-8">
        <div className="space-y-4">
          <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-success text-on-accent"><CheckIcon width={28} height={28} /></span>
          <h1 className="text-headline">Thank you. Your order is in.</h1>
          <p className="text-lead text-muted">
            We&rsquo;ve received your order and will contact you to confirm payment and delivery.
          </p>
        </div>

        <dl className="divide-y divide-line border-y border-line">
          <div className="flex justify-between gap-4 py-4"><dt className="text-muted">Order number</dt><dd className="font-display text-title">{order.orderNumber}</dd></div>
          <div className="flex justify-between gap-4 py-4"><dt className="text-muted">Confirmation sent to</dt><dd className="break-all text-right">{order.customerEmail}</dd></div>
          <div className="flex justify-between gap-4 py-4"><dt className="text-muted">Total</dt><dd className="font-medium">{formatPrice(order.total)}</dd></div>
        </dl>

        <p role="status" className="text-muted">
          {order.emailSent
            ? "A confirmation email is on its way. If you can't find it, check your spam folder."
            : "We couldn't send your confirmation email, but your order is safely recorded. Please keep your order number."}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/shop" size="lg">Continue shopping</ButtonLink>
          {isOwner && <ButtonLink href={`/account/orders/${order.id}`} size="lg" variant="secondary">View order</ButtonLink>}
        </div>
      </div>
    </Container>
  );
}
