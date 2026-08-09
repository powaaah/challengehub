import assert from "node:assert/strict";
import test from "node:test";
import { deliverRetentionEmailJobs } from "../lib/retention-delivery.ts";

const job = {
  id: "n1",
  type: "daily_reminder" as const,
  title: "Dein heutiger Check-in ist offen",
  body: "Trag deinen Fortschritt ein.",
  href: "/meine-challenges/p1",
  occurredAt: "2026-08-09T08:00:00.000Z",
  readAt: null,
  userId: "u1",
  email: "ada@example.test",
  participationId: "p1"
};

test("Queue quittiert ausschließlich erfolgreich zugestellte Retention-E-Mails", async () => {
  const delivered: string[] = [];
  const messages: Array<{ href: string; unsubscribeUrl: string }> = [];
  const result = await deliverRetentionEmailJobs({
    jobs: [job, { ...job, id: "n2" }],
    siteUrl: "https://challengehub.de",
    tokenSecret: "test-secret-with-enough-entropy",
    send: async (message) => {
      messages.push(message);
      return message.body.includes("Fortschritt")
        ? { status: "delivered" as const }
        : { status: "delivery_failed" as const };
    },
    markDelivered: (notificationId) => delivered.push(notificationId)
  });

  assert.deepEqual(result, { delivered: 2, deferred: 0, failed: 0 });
  assert.deepEqual(delivered, ["n1", "n2"]);
  assert.equal(messages[0]?.href, "https://challengehub.de/meine-challenges/p1");
  assert.match(messages[0]?.unsubscribeUrl ?? "", /^https:\/\/challengehub\.de\/notifications\/abmelden\?token=/);
});

test("fehlende Versandkonfiguration lässt den Job für den nächsten Lauf offen", async () => {
  let marked = false;
  const result = await deliverRetentionEmailJobs({
    jobs: [job],
    siteUrl: "https://challengehub.de",
    tokenSecret: "test-secret-with-enough-entropy",
    send: async () => ({ status: "not_configured" as const }),
    markDelivered: () => { marked = true; }
  });

  assert.deepEqual(result, { delivered: 0, deferred: 1, failed: 0 });
  assert.equal(marked, false);
});
