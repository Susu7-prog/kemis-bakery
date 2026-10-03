"use client";

import Image from "next/image";
import Link from "next/link";
import { cart, useCart, useCartOpen } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/format";
import { Sheet } from "@/components/ui/sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";

const stepper =
  "inline-flex size-9 items-center justify-center rounded-md border border-line-strong transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong";

/** Right-hand drawer on desktop, full screen on small viewports. */
export function CartSheet() {
  const open = useCartOpen();
  const { items, count, subtotal } = useCart();

  return (
    <Sheet
      open={open}
      onClose={() => cart.close()}
      label="Cart"
      className="inset-y-0 left-0 right-0 ml-0 h-dvh w-dvw flex-col open:flex sm:left-auto sm:ml-auto sm:w-110 sm:max-w-full sm:border-l sm:border-line"
    >
      <div className="flex h-(--header-height) shrink-0 items-center justify-between border-b border-line px-5">
        <h2 className="font-display text-title">Cart{count > 0 && ` (${count})`}</h2>
        <button type="button" onClick={() => cart.close()} aria-label="Close cart"
          className="inline-flex size-11 items-center justify-center rounded-md hover:bg-accent-soft">
          <CloseIcon />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center gap-5 px-6">
          <p className="font-display text-title">Your cart is empty.</p>
          <p className="text-muted">Add a loaf, a box of pies or a jar of yaji and it will show up here.</p>
          <ButtonLink href="/shop" onClick={() => cart.close()}>Shop the bakery</ButtonLink>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-4 py-5">
                <div className="relative aspect-4/5 w-20 shrink-0 overflow-hidden rounded-md bg-surface">
                  <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/products/${item.slug}`} onClick={() => cart.close()} className="font-medium hover:text-accent">{item.name}</Link>
                    <p className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <p className="text-caption text-muted">{formatPrice(item.price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button type="button" className={stepper} aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}>
                        <MinusIcon width={18} height={18} />
                      </button>
                      <span className="w-7 text-center tabular-nums" aria-live="polite">{item.quantity}</span>
                      <button type="button" className={stepper} aria-label={`Increase quantity of ${item.name}`}
                        disabled={item.quantity >= Math.min(item.maxQuantity, 20)}
                        onClick={() => cart.setQuantity(item.productId, item.quantity + 1)}>
                        <PlusIcon width={18} height={18} />
                      </button>
                    </div>
                    <button type="button" onClick={() => cart.remove(item.productId)}
                      className="text-caption underline underline-offset-4 decoration-line-strong hover:decoration-ink">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="shrink-0 space-y-4 border-t border-line bg-surface px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-baseline justify-between">
              <p className="font-medium">Subtotal</p>
              <p className="font-display text-title">{formatPrice(subtotal)}</p>
            </div>
            <p className="text-caption text-muted">Delivery and final totals are confirmed at checkout.</p>
            <Button size="lg" className="w-full" disabled aria-describedby="checkout-note">Checkout</Button>
            <p id="checkout-note" className="text-center text-caption text-muted">Checkout isn&rsquo;t available yet.</p>
            <div className="flex justify-between">
              <Button variant="quiet" onClick={() => cart.close()}>Continue shopping</Button>
              <Button variant="quiet" onClick={() => cart.clear()}>Clear cart</Button>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}
