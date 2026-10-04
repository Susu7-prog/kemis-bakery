/** Builds the order confirmation email (HTML and plain text). Pure; all user text is escaped. */
export type ConfirmationLine = { name: string; price: number; quantity: number };

export type ConfirmationOrder = {
  orderNumber: string;
  customerName: string;
  createdAt: string;
  items: ConfirmationLine[];
  subtotal: number;
  total: number;
};

const BRAND = { name: "Kemi's", fullName: "Kemi's Artisanal African Bakery & Spice Shop", accent: "#a31545", ink: "#2b1810" };

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Lagos" }).format(new Date(iso));

export function buildOrderConfirmation(order: ConfirmationOrder): { subject: string; html: string; text: string } {
  const firstName = order.customerName.split(" ")[0] || order.customerName;
  const date = formatDate(order.createdAt);
  const subject = `Your ${BRAND.name} order ${order.orderNumber}`;
  const message =
    "Thank you for your order. We have received it and will contact you using the details you gave us to confirm payment and delivery.";

  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e4d9d2">${escapeHtml(i.name)}<br><span style="color:#6b5a52;font-size:13px">${i.quantity} &times; ${money.format(i.price)}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #e4d9d2;text-align:right;white-space:nowrap">${money.format(i.price * i.quantity)}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#f8f4f1;font-family:Helvetica,Arial,sans-serif;color:${BRAND.ink}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdfb;border-radius:6px">
      <tr><td style="padding:28px 28px 8px"><div style="font-size:28px;font-weight:700;color:${BRAND.accent}">Kemi&rsquo;s</div>
        <div style="font-size:12px;color:#6b5a52">Artisanal African Bakery &amp; Spice Shop</div></td></tr>
      <tr><td style="padding:16px 28px 0">
        <h1 style="margin:0 0 12px;font-size:22px">Thank you, ${escapeHtml(firstName)}.</h1>
        <p style="margin:0 0 20px;line-height:1.6">${message}</p>
        <p style="margin:0;font-size:13px;color:#6b5a52">Order number</p>
        <p style="margin:0 0 4px;font-size:20px;font-weight:700">${escapeHtml(order.orderNumber)}</p>
        <p style="margin:0 0 20px;font-size:13px;color:#6b5a52">Placed ${escapeHtml(date)}</p>
      </td></tr>
      <tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
        <tr><td style="padding:12px 0 4px;color:#6b5a52">Subtotal</td><td style="padding:12px 0 4px;text-align:right">${money.format(order.subtotal)}</td></tr>
        <tr><td style="padding:4px 0 20px;font-weight:700">Total</td><td style="padding:4px 0 20px;text-align:right;font-weight:700;font-size:18px">${money.format(order.total)}</td></tr>
      </table></td></tr>
      <tr><td style="padding:16px 28px 28px;border-top:1px solid #e4d9d2;font-size:12px;color:#6b5a52">${escapeHtml(BRAND.fullName)}</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    `${BRAND.fullName}`,
    "",
    `Thank you, ${firstName}.`,
    message,
    "",
    `Order number: ${order.orderNumber}`,
    `Placed: ${date}`,
    "",
    ...order.items.map((i) => `${i.name}\n  ${i.quantity} x ${money.format(i.price)} = ${money.format(i.price * i.quantity)}`),
    "",
    `Subtotal: ${money.format(order.subtotal)}`,
    `Total: ${money.format(order.total)}`,
  ].join("\n");

  return { subject, html, text };
}
