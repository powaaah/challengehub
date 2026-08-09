import * as assert from "node:assert/strict";
import { test } from "node:test";
import { sendEmailVerificationEmail } from "../lib/email-verification-email.ts";

test("Verifikationsmail wird ohne Zugangsdaten nicht extern versendet", async () => {
  let called = false;
  const result = await sendEmailVerificationEmail(
    { email: "neu@example.test", verificationUrl: "https://challengehub.de/auth/email-bestaetigen?token=test" },
    { apiKey: "", from: "", fetch: async () => { called = true; return new Response(); } }
  );

  assert.deepEqual(result, { status: "not_configured" });
  assert.equal(called, false);
});

test("Verifikationsmail nutzt die konfigurierte Resend-API", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const result = await sendEmailVerificationEmail(
    { email: "neu@example.test", verificationUrl: "https://challengehub.de/auth/email-bestaetigen?token=test" },
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
  const body = JSON.parse(String(requests[0]?.init?.body));
  assert.equal(body.subject, "Bestätige deine E-Mail-Adresse bei ChallengeHub");
  assert.match(body.html, /E-Mail-Adresse bestätigen/);
  assert.match(body.html, /30 Minuten gültig/);
});
