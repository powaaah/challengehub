import assert from "node:assert/strict";
import test from "node:test";
import { sendRetentionEmail } from "../lib/retention-email.ts";

test("Retention-E-Mail bleibt ohne Versandkonfiguration in der Queue", async () => {
  let called = false;
  const result = await sendRetentionEmail(
    {
      email: "ada@example.test",
      subject: "Heute zählt",
      body: "Deine Challenge wartet.",
      href: "https://challengehub.de/meine-challenges/p1",
      unsubscribeUrl: "https://challengehub.de/notifications/abmelden?token=test"
    },
    { apiKey: "", from: "", fetch: async () => { called = true; return new Response(); } }
  );

  assert.deepEqual(result, { status: "not_configured" });
  assert.equal(called, false);
});

test("Retention-E-Mail enthält Handlung und direkte Abmeldung", async () => {
  let body = "";
  const result = await sendRetentionEmail(
    {
      email: "ada@example.test",
      subject: "Dein Wochenrückblick",
      body: "Du warst an 4 von 7 Tagen dabei.",
      href: "https://challengehub.de/meine-challenges/p1",
      unsubscribeUrl: "https://challengehub.de/notifications/abmelden?token=test"
    },
    {
      apiKey: "test-key",
      from: "ChallengeHub <noreply@challengehub.de>",
      fetch: async (_url, init) => {
        body = String(init?.body);
        return new Response(null, { status: 202 });
      }
    }
  );

  assert.deepEqual(result, { status: "delivered" });
  assert.match(body, /Dein Wochenrückblick/);
  assert.match(body, /Jetzt öffnen/);
  assert.match(body, /E-Mails abbestellen/);
});
