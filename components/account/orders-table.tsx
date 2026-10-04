import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/orders/status";
import type { OrderSummary } from "@/lib/orders/queries";

export function OrdersList({ orders }: { orders: OrderSummary[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map((order) => (
        <li key={order.id}>
          <Link href={`/account/orders/${order.id}`} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-4 hover:bg-surface sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center sm:px-3">
            <span className="font-medium">{order.orderNumber}</span>
            <span className="row-start-2 text-caption text-muted sm:row-start-auto sm:text-body">{formatDate(order.createdAt)}</span>
            <span className="col-start-2 row-span-1 text-right sm:col-start-auto sm:text-left">{formatPrice(order.total)}</span>
            <span className="col-start-2 row-start-2 justify-self-end rounded-sm bg-accent-soft px-2 py-0.5 text-caption font-medium sm:col-start-auto sm:row-start-auto">
              {orderStatusLabel(order.status)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
