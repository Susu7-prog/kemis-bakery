/** Minimal Mailgun sender. Server use only; the API key must never reach the browser. */
export type MailgunConfig = { apiKey: string; domain: string; from: string; baseUrl?: string };
export type EmailMessage = { to: string; subject: string; html: string; text: string };
export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; reason: "not_configured" | "invalid" | "rejected" | "network"; status?: number };

export function createMailgunSender(config: MailgunConfig | null, fetchImpl: typeof fetch = fetch) {
  return async function send(message: EmailMessage): Promise<SendResult> {
    if (!config) return { ok: false, reason: "not_configured" };
    // Header injection guard: addresses and subjects are single-line values.
    if (/[\r\n]/.test(message.to) || /[\r\n]/.test(message.subject)) return { ok: false, reason: "invalid" };

    const base = (config.baseUrl ?? "https://api.mailgun.net").replace(/\/$/, "");
    try {
      const response = await fetchImpl(`${base}/v3/${encodeURIComponent(config.domain)}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${config.apiKey}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: config.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return { ok: false, reason: "rejected", status: response.status };
      const body = (await response.json().catch(() => ({}))) as { id?: string };
      return { ok: true, id: body.id };
    } catch {
      return { ok: false, reason: "network" };
    }
  };
}
