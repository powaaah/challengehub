import * as assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { requestEmailVerification, verifyEmailToken } from "../lib/email-verification.ts";

test("Verifikationsanfrage bleibt neutral und persistiert nur den Hash eines 30-Minuten-Tokens", async () => {
  const created: unknown[] = [];
  const delivered: unknown[] = [];
  const confirmed: unknown[] = [];
  const rawToken = "v".repeat(43);

  const result = await requestEmailVerification({
    email: " NEU@example.test ",
    now: new Date("2026-08-09T11:00:00.000Z"),
    findAccountByEmail: () => ({ id: "u1", email: "neu@example.test", emailVerifiedAt: null }),
    createToken: (input) => {
      created.push(input);
      return { status: "created" };
    },
    confirmDelivery: (input) => confirmed.push(input),
    discardToken: () => assert.fail("zugestelltes Token darf nicht verworfen werden"),
    generateToken: () => rawToken,
    generateId: () => "verify-1",
    deliver: async (message) => delivered.push(message),
    siteUrl: "https://challengehub.de"
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.deepEqual(created, [{
    id: "verify-1",
    userId: "u1",
    tokenHash: createHash("sha256").update(rawToken).digest("hex"),
    expiresAt: "2026-08-09T11:30:00.000Z"
  }]);
  assert.deepEqual(delivered, [{
    email: "neu@example.test",
    verificationUrl: `https://challengehub.de/auth/email-bestaetigen?token=${rawToken}`
  }]);
  assert.deepEqual(confirmed, [{
    id: "verify-1",
    userId: "u1",
    deliveredAt: "2026-08-09T11:00:00.000Z"
  }]);
  assert.ok(!JSON.stringify(created).includes(rawToken));
});

test("unbekannte oder bereits verifizierte Konten erhalten dieselbe neutrale Antwort ohne Versand", async () => {
  let deliveries = 0;
  const base = {
    now: new Date("2026-08-09T11:00:00.000Z"),
    confirmDelivery: () => assert.fail("es darf kein Token bestätigt werden"),
    discardToken: () => assert.fail("es darf kein Token verworfen werden"),
    generateToken: () => "v".repeat(43),
    generateId: () => "verify-1",
    deliver: async () => { deliveries += 1; },
    siteUrl: "https://challengehub.de"
  };

  assert.deepEqual(await requestEmailVerification({
    ...base,
    email: "unbekannt@example.test",
    findAccountByEmail: () => null,
    createToken: () => assert.fail("unbekannte Konten erhalten kein Token")
  }), { status: "accepted" });
  assert.deepEqual(await requestEmailVerification({
    ...base,
    email: "fertig@example.test",
    findAccountByEmail: () => ({ id: "u2", email: "fertig@example.test", emailVerifiedAt: "2026-08-09T10:00:00.000Z" }),
    createToken: () => assert.fail("verifizierte Konten erhalten kein Token")
  }), { status: "accepted" });
  assert.equal(deliveries, 0);
});

test("fehlgeschlagene Zustellung verwirft den neuen Verifikationslink", async () => {
  const discarded: unknown[] = [];
  await requestEmailVerification({
    email: "neu@example.test",
    now: new Date("2026-08-09T11:00:00.000Z"),
    findAccountByEmail: () => ({ id: "u1", email: "neu@example.test", emailVerifiedAt: null }),
    createToken: () => ({ status: "created" }),
    confirmDelivery: () => assert.fail("fehlgeschlagene Zustellung darf nichts bestätigen"),
    discardToken: (input) => discarded.push(input),
    generateToken: () => "v".repeat(43),
    generateId: () => "verify-2",
    deliver: async () => { throw new Error("mail unavailable"); },
    siteUrl: "https://challengehub.de"
  });

  assert.deepEqual(discarded, [{ id: "verify-2", userId: "u1" }]);
});

test("nur syntaktisch gültige Einmal-Tokens erreichen das Repository", () => {
  const calls: unknown[] = [];
  const verify = (input: unknown) => {
    calls.push(input);
    return { status: "verified" as const };
  };

  assert.deepEqual(verifyEmailToken({ token: "kurz", now: new Date(), verify }), { status: "invalid_token" });
  assert.deepEqual(verifyEmailToken({
    token: "v".repeat(43),
    now: new Date("2026-08-09T11:10:00.000Z"),
    verify
  }), { status: "verified" });
  assert.deepEqual(calls, [{
    tokenHash: createHash("sha256").update("v".repeat(43)).digest("hex"),
    now: "2026-08-09T11:10:00.000Z"
  }]);
});
