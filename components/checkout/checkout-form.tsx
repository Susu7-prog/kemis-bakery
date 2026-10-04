"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { placeOrderAction } from "@/app/actions/checkout";
import { cart, useCart, useCartHydrated } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/format";
import { validateCheckoutFields, type CheckoutErrors, type CheckoutFields } from "@/lib/validation/checkout";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

const KEY_STORAGE = "kemis-checkout-attempt";

/**
 * One idempotency key per checkout attempt. It survives a refresh and is replaced when the cart
 * contents change, so a repeated submission can never create a second order for the same cart.
 */
function attemptKey(fingerprint: string): string {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY_STORAGE) ?? "null") as { fp?: string; key?: string } | null;
    if (saved && saved.fp === fingerprint && typeof saved.key === "string") return saved.key;
  } catch {
    // fall through and create a new key
  }
  const key = crypto.randomUUID();
  try {
    sessionStorage.setItem(KEY_STORAGE, JSON.stringify({ fp: fingerprint, key }));
  } catch {
    // Storage unavailable: the in-flight guard below still blocks double clicks.
  }
  return key;
}

type Props = { orderingAvailable: boolean; defaults: { fullName: string; email: string }; signedIn: boolean };

export function CheckoutForm({ orderingAvailable, defaults, signedIn }: Props) {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const { items, subtotal } = useCart();
  const [values, setValues] = useState<CheckoutFields>({ fullName: defaults.fullName, email: defaults.email, phone: "", address: "", city: "" });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: keyof CheckoutFields) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function focusFirstError(found: CheckoutErrors) {
    const order: (keyof CheckoutFields)[] = ["fullName", "email", "phone", "address", "city"];
    const first = order.find((f) => found[f]);
    if (first) formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !orderingAvailable) return; // blocks double clicks before state updates land
    setFormError(null);

    const checked = validateCheckoutFields(values);
    if (!checked.ok) {
      setErrors(checked.errors);
      focusFirstError(checked.errors);
      return;
    }
    setErrors({});

    inFlight.current = true;
    setSubmitting(true);
    let navigating = false;
    try {
      const fingerprint = items.map((i) => `${i.productId}:${i.quantity}`).sort().join("|");
      const result = await placeOrderAction({
        fields: values,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        idempotencyKey: attemptKey(fingerprint),
        expectedSubtotal: subtotal,
        website: String(new FormData(event.currentTarget).get("website") ?? ""),
      });

      if (result.ok) {
        navigating = true;
        setDone(true);
        try { sessionStorage.removeItem(KEY_STORAGE); } catch { /* ignore */ }
        cart.clear();
        router.push(`/order-success/${result.orderNumber}`);
        return;
      }

      if (result.code === "validation") {
        setErrors(result.fieldErrors);
        focusFirstError(result.fieldErrors);
      } else if (result.code === "cart") {
        if (result.lines) cart.applyServerLines(result.lines);
        if (result.reason === "insufficient_stock" && result.productId) cart.limitStock(result.productId, result.available ?? 0);
        if (result.reason === "unavailable" && result.productId) cart.remove(result.productId);
      }
      setFormError(result.message);
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      if (!navigating) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  }

  if (!hydrated) {
    return (
      <div role="status" aria-label="Loading your cart" className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-line" />)}</div>
        <div className="h-64 animate-pulse rounded-md bg-line" />
        <span className="sr-only">Loading your cart</span>
      </div>
    );
  }

  if (done) {
    return <p role="status" className="mt-10 font-display text-title">Order placed. Taking you to your confirmation...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 max-w-md space-y-4">
        <p className="font-display text-title">Your cart is empty.</p>
        <p className="text-muted">Add something from the bakery and come back to check out.</p>
        <ButtonLink href="/shop">Shop the bakery</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby={formError ? "checkout-error" : undefined} className="space-y-6">
        {!orderingAvailable && (
          <p role="status" className="rounded-md border border-line-strong bg-surface p-4 text-muted">Ordering isn&rsquo;t available yet, so this form can&rsquo;t be submitted.</p>
        )}
        <p className="text-muted">
          {signedIn ? "You're signed in, so this order will appear in your account." : "Checking out as a guest. "}
          {!signedIn && <Link href="/login?next=/checkout" className="underline underline-offset-4 decoration-accent">Sign in</Link>}
        </p>

        <fieldset className="space-y-5">
          <legend className="font-display text-title">Your details</legend>
          <Field id="fullName" name="fullName" label="Full name" autoComplete="name" required value={values.fullName} onChange={set("fullName")} error={errors.fullName} />
          <Field id="email" name="email" type="email" inputMode="email" label="Email" autoComplete="email" required value={values.email} onChange={set("email")} error={errors.email} hint="We'll send your order confirmation here." />
          <Field id="phone" name="phone" type="tel" inputMode="tel" label="Phone" autoComplete="tel" required value={values.phone} onChange={set("phone")} error={errors.phone} hint="For example 0803 123 4567." />
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="font-display text-title">Delivery</legend>
          <Field id="address" name="address" label="Address" autoComplete="street-address" required value={values.address} onChange={set("address")} error={errors.address} />
          <Field id="city" name="city" label="City" autoComplete="address-level2" required value={values.city} onChange={set("city")} error={errors.city} />
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech */}
        <div className="sr-only" aria-hidden="true"><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>

        {formError && <p id="checkout-error" role="alert" className="rounded-md border border-danger/40 bg-surface p-4 text-danger">{formError}</p>}

        <div className="space-y-3 border-t border-line pt-6">
          <div className="flex items-baseline justify-between"><span className="font-medium">Total</span><span className="font-display text-title">{formatPrice(subtotal)}</span></div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting || !orderingAvailable} aria-busy={submitting}>
            {submitting ? "Placing your order..." : "Place order"}
          </Button>
          <p className="text-caption text-muted">We&rsquo;ll check prices and stock when you place your order, then contact you to confirm payment and delivery.</p>
        </div>
      </form>

      <aside aria-labelledby="summary-title" className="lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
        <h2 id="summary-title" className="font-display text-title">Order summary</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-4">
              <div className="relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-md bg-surface"><Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" /></div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent">{item.name}</Link>
                <p className="text-caption text-muted">{item.quantity} &times; {formatPrice(item.price)}</p>
              </div>
              <p className="shrink-0 font-medium">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between font-display text-title"><dt>Total</dt><dd>{formatPrice(subtotal)}</dd></div>
        </dl>
        <Link href="/shop" className="mt-6 inline-block text-caption underline underline-offset-4 decoration-line-strong hover:decoration-ink">Continue shopping</Link>
      </aside>
    </div>
  );
}
