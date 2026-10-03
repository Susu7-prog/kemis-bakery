"use client";

import { useActionState } from "react";
import { subscribeAction, type NewsletterState } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";

const initial: NewsletterState = { status: "idle" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initial);

  if (state.status === "success") {
    return <p role="status" className="font-display text-title">{state.message}</p>;
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Field id="newsletter-email" name="email" type="email" label="Email address" hideLabel
          placeholder="Your email address" autoComplete="email" inputMode="email" required
          error={state.status === "error" ? state.message : undefined} />
      </div>
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden="true" className="sr-only">
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <Button type="submit" size="md" className="h-12 sm:px-7" disabled={pending}>
        {pending ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}
