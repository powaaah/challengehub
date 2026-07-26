import * as assert from "node:assert/strict";
import { test } from "node:test";
import { sendPasswordResetEmail } from "../lib/password-reset-email.ts";

test("Reset-E-Mail wird ohne konfigurierte Zugangsdaten nicht extern versendet", async () => {
  let called = false;
  const result = await sendPasswordResetEmail(
    { email: "stefan@example.com", resetUrl: "https://challengehub.de/reset" },
    { apiKey: "", from: "", fetch: async () => { called = true; return new Response(); } }
  );

  assert.deepEqual(result, { status: "not_configured" });
  assert.equal(called, false);
});

test("Reset-E-Mail wird über die konfigurierte Resend-API ausgeliefert", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const result = await sendPasswordResetEmail(
    { email: "stefan@example.com", resetUrl: "https://challengehub.de/auth/passwort-zuruecksetzen?token=test" },
    {
      apiKey: "test-key",
      from: "ChallengeHub <noreply@challengehub.de>",
      fetch: async (url, init) => {
        requests.push({ url: String(url), init });
        return new Response("{}", { status: 200 });
      }
    }
  );

  assert.deepEqual(result, { status: "delivered" });
  assert.equal(requests[0]?.url, "https://api.resend.com/emails");
  assert.equal(requests[0]?.init?.headers && (requests[0].init.headers as Record<string, string>).Authorization, "Bearer test-key");
  assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
    from: "ChallengeHub <noreply@challengehub.de>",
    to: ["stefan@example.com"],
    subject: "Dein neues ChallengeHub-Passwort",
    html: '<p>Du hast ein neues Passwort für ChallengeHub angefordert.</p><p><a href="https://challengehub.de/auth/passwort-zuruecksetzen?token=test">Passwort jetzt zurücksetzen</a></p><p>Der Link ist 30 Minuten gültig und kann nur einmal verwendet werden.</p>'
  });
});
