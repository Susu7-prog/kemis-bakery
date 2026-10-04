/** Builds the order confirmation email (HTML and plain text). Pure; all customer text is escaped. */
export type ConfirmationLine = { name: string; price: number; quantity: number };

export type ConfirmationOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
  items: ConfirmationLine[];
  subtotal: number;
  total: number;
  /** Shown as the contact address when the shop has one configured. */
  contactEmail?: string;
};

const BRAND = {
  name: "Kemi's",
  fullName: "Kemi's Artisanal African Bakery & Spice Shop",
  accent: "#a31545",
  ink: "#2b1810",
  muted: "#6b5a52",
  line: "#e4d9d2",
  paper: "#f8f4f1",
};

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(iso));

const NEXT_STEP =
  "We have received your order. We will contact you on the phone number or email below to confirm payment and delivery. Nothing has been charged yet.";

export function buildOrderConfirmation(order: ConfirmationOrder): { subject: string; html: string; text: string } {
  const firstName = order.customerName.split(" ")[0] || order.customerName;
  const date = formatDate(order.createdAt);
  const subject = `Your order ${order.orderNumber} is confirmed | ${BRAND.name}`;
  const contactLine = order.contactEmail
    ? `Questions? Reply to this email or write to ${order.contactEmail}.`
    : "Questions? Just reply to this email.";

  const itemRows = order.items
    .map(
      (i) => `<tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:15px;line-height:1.4">${escapeHtml(i.name)}<br><span style="color:${BRAND.muted};font-size:13px">${i.quantity} &times; ${money.format(i.price)}</span></td>
          <td align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${BRAND.line};font-size:15px;white-space:nowrap;vertical-align:top">${money.format(i.price * i.quantity)}</td>
        </tr>`,
    )
    .join("");

  const detail = (label: string, value: string) =>
    `<p style="margin:0 0 10px;font-size:14px;line-height:1.5"><span style="display:block;color:${BRAND.muted};font-size:12px;text-transform:uppercase;letter-spacing:.04em">${label}</span>${escapeHtml(value)}</p>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.ink}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Order ${escapeHtml(order.orderNumber)}: we have received your order. Total ${money.format(order.total)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper}">
  <tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px">
      <tr><td style="padding:28px 28px 20px;border-bottom:4px solid ${BRAND.accent}">
        <div style="font-size:30px;font-weight:700;line-height:1;color:${BRAND.accent}">Kemi&rsquo;s</div>
        <div style="margin-top:6px;font-size:12px;color:${BRAND.muted}">Artisanal African Bakery &amp; Spice Shop</div>
      </td></tr>
      <tr><td style="padding:28px 28px 8px">
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3">Thank you, ${escapeHtml(firstName)}.</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${NEXT_STEP}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper};border-radius:6px"><tr><td style="padding:14px 16px">
          <span style="display:block;color:${BRAND.muted};font-size:12px;text-transform:uppercase;letter-spacing:.04em">Order number</span>
          <span style="display:block;font-size:20px;font-weight:700">${escapeHtml(order.orderNumber)}</span>
          <span style="display:block;margin-top:4px;color:${BRAND.muted};font-size:13px">Placed ${escapeHtml(date)} (Lagos time)</span>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:20px 28px 0">
        <h2 style="margin:0 0 4px;font-size:16px">Your order</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemRows}
          <tr><td style="padding:14px 0 4px;font-size:14px;color:${BRAND.muted}">Subtotal</td><td align="right" style="padding:14px 0 4px;font-size:14px">${money.format(order.subtotal)}</td></tr>
          <tr><td style="padding:4px 0 8px;font-size:17px;font-weight:700">Total</td><td align="right" style="padding:4px 0 8px;font-size:17px;font-weight:700">${money.format(order.total)}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:16px 28px 0">
        <h2 style="margin:0 0 12px;font-size:16px">Your details</h2>
        ${detail("Name", order.customerName)}
        ${detail("Email", order.customerEmail)}
        ${detail("Phone", order.phone)}
        ${detail("Delivery address", `${order.address}, ${order.city}`)}
      </td></tr>
      <tr><td style="padding:12px 28px 28px">
        <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.muted}">${escapeHtml(contactLine)}</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid ${BRAND.line};font-size:12px;color:${BRAND.muted}">${escapeHtml(BRAND.fullName)}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    BRAND.fullName,
    "",
    `Thank you, ${firstName}.`,
    NEXT_STEP,
    "",
    `ORDER ${order.orderNumber}`,
    `Placed: ${date} (Lagos time)`,
    "",
    "YOUR ORDER",
    ...order.items.map((i) => `- ${i.name}\n  ${i.quantity} x ${money.format(i.price)} = ${money.format(i.price * i.quantity)}`),
    "",
    `Subtotal: ${money.format(order.subtotal)}`,
    `Total: ${money.format(order.total)}`,
    "",
    "YOUR DETAILS",
    `Name: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.phone}`,
    `Delivery address: ${order.address}, ${order.city}`,
    "",
    contactLine,
  ].join("\n");

  return { subject, html, text };
}
