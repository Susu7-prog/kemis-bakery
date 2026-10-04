/**
 * Checkout validation shared by the browser (instant feedback) and the server (the real check).
 * Pure functions with no framework imports so they can be unit tested directly.
 */
export const MAX_LINE_QUANTITY = 20;
export const MAX_CART_LINES = 50;

export type CheckoutFields = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
};

export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

export type OrderLineInput = { productId: string; quantity: number };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY_PATTERN = /^[A-Za-z0-9_-]{8,100}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Accepts Nigerian numbers (0803..., +234803...) or other international numbers; returns +E.164. */
export function normalizePhone(raw: string): string | null {
  const stripped = raw.replace(/[\s\-().]/g, "");
  if (/^0[789][01]\d{8}$/.test(stripped)) return `+234${stripped.slice(1)}`;
  if (/^\+?234[789][01]\d{8}$/.test(stripped)) return `+${stripped.replace(/^\+/, "")}`;
  if (/^\+[1-9]\d{7,14}$/.test(stripped)) return stripped;
  return null;
}

const clean = (value: unknown): string => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

export function validateCheckoutFields(
  input: unknown,
): { ok: true; data: CheckoutFields } | { ok: false; errors: CheckoutErrors } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const fullName = clean(raw.fullName);
  const email = clean(raw.email).toLowerCase();
  const phoneRaw = clean(raw.phone);
  const address = clean(raw.address);
  const city = clean(raw.city);
  const errors: CheckoutErrors = {};

  if (fullName.length < 2) errors.fullName = "Enter your full name.";
  else if (fullName.length > 120 || CONTROL_CHARS.test(fullName)) errors.fullName = "Enter a valid name (up to 120 characters).";

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address, for example amaka@example.com.";

  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (!phoneRaw) errors.phone = "Enter your phone number.";
  else if (!phone) errors.phone = "Enter a valid phone number, for example 0803 123 4567.";

  if (address.length < 5) errors.address = "Enter your delivery address.";
  else if (address.length > 300) errors.address = "Address is too long (up to 300 characters).";

  if (city.length < 2) errors.city = "Enter your city.";
  else if (city.length > 100 || CONTROL_CHARS.test(city)) errors.city = "Enter a valid city.";

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors };
  return { ok: true, data: { fullName, email, phone, address, city } };
}

export function validateOrderItems(
  input: unknown,
): { ok: true; items: OrderLineInput[] } | { ok: false } {
  if (!Array.isArray(input) || input.length < 1 || input.length > MAX_CART_LINES) return { ok: false };
  const items: OrderLineInput[] = [];
  for (const entry of input) {
    if (!entry || typeof entry !== "object") return { ok: false };
    const { productId, quantity } = entry as Record<string, unknown>;
    if (typeof productId !== "string" || !UUID_PATTERN.test(productId)) return { ok: false };
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) return { ok: false };
    items.push({ productId: productId.toLowerCase(), quantity });
  }
  return { ok: true, items };
}

export function isValidIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && KEY_PATTERN.test(value);
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
