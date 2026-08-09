export type EmailVerificationMessage = {
  email: string;
  verificationUrl: string;
};

type EmailVerificationConfig = {
  apiKey?: string;
  from?: string;
  fetch?: typeof fetch;
};

export async function sendEmailVerificationEmail(
  message: EmailVerificationMessage,
  config: EmailVerificationConfig = {}
) {
  const apiKey = config.apiKey ?? process.env.RESEND_API_KEY ?? "";
  const from = config.from ?? process.env.EMAIL_VERIFICATION_FROM_EMAIL ?? "";
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
      subject: "Bestätige deine E-Mail-Adresse bei ChallengeHub",
      html: `<p>Willkommen bei ChallengeHub.</p><p><a href="${escapeHtml(message.verificationUrl)}">E-Mail-Adresse bestätigen</a></p><p>Der Link ist 30 Minuten gültig und kann nur einmal verwendet werden.</p>`
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
