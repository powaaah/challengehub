export type RetentionEmailMessage = {
  email: string;
  subject: string;
  body: string;
  href: string;
  unsubscribeUrl: string;
};

type RetentionEmailConfig = {
  apiKey?: string;
  from?: string;
  fetch?: typeof fetch;
};

export async function sendRetentionEmail(
  message: RetentionEmailMessage,
  config: RetentionEmailConfig = {}
) {
  const apiKey = config.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const from = config.from ?? process.env.RETENTION_FROM_EMAIL ?? "";
  if (!apiKey || !from) return { status: "not_configured" as const };

  const fetchRequest = config.fetch ?? fetch;
  const response = await fetchRequest("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [message.email],
      subject: message.subject,
      html: `<p>${escapeHtml(message.body)}</p><p><a href="${escapeHtml(message.href)}">Jetzt öffnen</a></p><p><a href="${escapeHtml(message.unsubscribeUrl)}">E-Mails abbestellen</a></p>`
    })
  });

  return response.ok
    ? { status: "delivered" as const }
    : { status: "delivery_failed" as const };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
