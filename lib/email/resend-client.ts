/**
 * Minimal Resend sender (https://resend.com/docs/api-reference/emails/send-email).
 * Server use only: the API key must never reach the browser.
 */
export type ResendConfig = { apiKey: string; from: string; replyTo?: string; baseUrl?: string };
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Stops Resend sending the same message twice if the call is retried (valid for 24 hours). */
  idempotencyKey?: string;
};
export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "not_configured" | "invalid" | "rejected" | "network"; status?: number; detail?: string };

export function createResendSender(config: ResendConfig | null, fetchImpl: typeof fetch = fetch) {
  return async function send(message: EmailMessage): Promise<SendResult> {
    if (!config) return { ok: false, reason: "not_configured" };
    // Header injection guard: addresses and subjects are single-line values.
    if (/[\r\n]/.test(message.to) || /[\r\n]/.test(message.subject)) return { ok: false, reason: "invalid" };

    const base = (config.baseUrl ?? "https://api.resend.com").replace(/\/$/, "");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    if (message.idempotencyKey) headers["Idempotency-Key"] = message.idempotencyKey;

    try {
      const response = await fetchImpl(`${base}/emails`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: config.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          ...(config.replyTo ? { reply_to: config.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10000),
      });
      const body = (await response.json().catch(() => ({}))) as { id?: string; name?: string };
      if (!response.ok) {
        // `name` is Resend's error category (for example "validation_error"). Never the key or recipient.
        return { ok: false, reason: "rejected", status: response.status, detail: typeof body.name === "string" ? body.name : undefined };
      }
      return { ok: true, id: body.id };
    } catch {
      return { ok: false, reason: "network" };
    }
  };
}
