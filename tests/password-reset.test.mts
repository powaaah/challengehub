import * as assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  requestPasswordReset,
  resetPasswordWithToken
} from "../lib/password-reset.ts";

test("Passwort-Reset-Anfrage bleibt neutral und persistiert nur den Hash eines kurzlebigen Tokens", async () => {
  const created: unknown[] = [];
  const delivered: unknown[] = [];
  const confirmed: unknown[] = [];
  const rawToken = "a".repeat(43);
  const account = {
    id: "u1",
    email: "stefan@example.com",
    name: "Stefan",
    passwordHash: "old",
    createdAt: "2026-07-24T09:00:00.000Z"
  };

  const result = await requestPasswordReset({
    email: " STEFAN@example.com ",
    now: new Date("2026-07-24T10:00:00.000Z"),
    findAccountByEmail: () => account,
    createToken: (input) => {
      created.push(input);
      return { status: "created" };
    },
    confirmDelivery: (input) => confirmed.push(input),
    discardToken: () => assert.fail("zugestelltes Token darf nicht verworfen werden"),
    generateToken: () => rawToken,
    generateId: () => "reset-1",
    deliver: async (message) => {
      delivered.push(message);
    },
    siteUrl: "https://challengehub.de"
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.deepEqual(created, [{
    id: "reset-1",
    userId: "u1",
    tokenHash: createHash("sha256").update(rawToken).digest("hex"),
    expiresAt: "2026-07-24T10:30:00.000Z"
  }]);
  assert.deepEqual(delivered, [{
    email: "stefan@example.com",
    resetUrl: `https://challengehub.de/auth/passwort-zuruecksetzen?token=${rawToken}`
  }]);
  assert.deepEqual(confirmed, [{
    id: "reset-1",
    userId: "u1",
    deliveredAt: "2026-07-24T10:00:00.000Z"
  }]);
  assert.ok(!JSON.stringify(created).includes(rawToken));
});

test("Passwort-Reset-Anfrage verrät unbekannte E-Mail-Adressen nicht", async () => {
  let created = false;
  let delivered = false;

  const result = await requestPasswordReset({
    email: "unknown@example.com",
    now: new Date("2026-07-24T10:00:00.000Z"),
    findAccountByEmail: () => null,
    createToken: () => {
      created = true;
      return { status: "created" };
    },
    confirmDelivery: () => assert.fail("unbekanntes Konto darf nichts bestätigen"),
    discardToken: () => assert.fail("unbekanntes Konto darf nichts verwerfen"),
    generateToken: () => "a".repeat(43),
    generateId: () => "reset-1",
    deliver: async () => {
      delivered = true;
    },
    siteUrl: "https://challengehub.de"
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.equal(created, false);
  assert.equal(delivered, false);
});

test("fehlgeschlagene Zustellung verwirft das neue Reset-Token", async () => {
  const discarded: unknown[] = [];
  const result = await requestPasswordReset({
    email: "stefan@example.com",
    now: new Date("2026-07-24T10:00:00.000Z"),
    findAccountByEmail: () => ({
      id: "u1",
      email: "stefan@example.com",
      name: "Stefan",
      passwordHash: "old",
      createdAt: "2026-07-24T09:00:00.000Z"
    }),
    createToken: () => ({ status: "created" }),
    confirmDelivery: () => assert.fail("fehlgeschlagene Zustellung darf nichts bestätigen"),
    discardToken: (input) => discarded.push(input),
    generateToken: () => "a".repeat(43),
    generateId: () => "reset-2",
    deliver: async () => {
      throw new Error("mail unavailable");
    },
    siteUrl: "https://challengehub.de"
  });

  assert.deepEqual(result, { status: "accepted" });
  assert.deepEqual(discarded, [{ id: "reset-2", userId: "u1" }]);
});

test("Passwort wird nur mit syntaktisch gültigem Einmal-Token und mindestens acht Zeichen geändert", () => {
  const calls: unknown[] = [];
  const resetPassword = (input: unknown) => {
    calls.push(input);
    return { status: "reset" as const };
  };

  assert.deepEqual(resetPasswordWithToken({ token: "kurz", password: "neues-passwort", resetPassword }), {
    status: "invalid_token"
  });
  assert.deepEqual(resetPasswordWithToken({ token: "a".repeat(43), password: "kurz", resetPassword }), {
    status: "invalid_password"
  });
  assert.deepEqual(resetPasswordWithToken({
    token: "a".repeat(43),
    password: "ä".repeat(65),
    now: new Date("2026-07-24T10:15:00.000Z"),
    hashPassword: () => assert.fail("überlange Passwörter dürfen die KDF nicht erreichen"),
    resetPassword
  }), { status: "invalid_password" });
  assert.deepEqual(resetPasswordWithToken({
    token: "a".repeat(43),
    password: "neues-passwort",
    now: new Date("2026-07-24T10:15:00.000Z"),
    isTokenActive: () => false,
    hashPassword: () => assert.fail("unbekannte Tokens dürfen die KDF nicht erreichen"),
    resetPassword
  }), { status: "invalid_token" });
  assert.deepEqual(resetPasswordWithToken({
    token: "a".repeat(43),
    password: "neues-passwort",
    now: new Date("2026-07-24T10:15:00.000Z"),
    isTokenActive: () => true,
    hashPassword: () => "new-password-hash",
    resetPassword
  }), { status: "reset" });
  assert.deepEqual(calls, [{
    tokenHash: createHash("sha256").update("a".repeat(43)).digest("hex"),
    passwordHash: "new-password-hash",
    now: "2026-07-24T10:15:00.000Z"
  }]);
});
