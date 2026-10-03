"use server";

import { subscribeToNewsletter } from "@/lib/newsletter";

export type NewsletterState = { status: "idle" | "error" | "success"; message?: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeAction(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "") !== "") return { status: "success", message: "Thanks for signing up." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address, for example amaka@example.com." };
  }

  try {
    const result = await subscribeToNewsletter(email);
    if (!result.ok) return { status: "error", message: "Sign-up isn't open yet. Please check back soon." };
    return { status: "success", message: "You're on the list. We'll email you when a new bake drops." };
  } catch (error) {
    console.error("[newsletter] subscribe failed", error instanceof Error ? error.message : "unknown error");
    return { status: "error", message: "Something went wrong on our side. Please try again." };
  }
}
