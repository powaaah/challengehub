import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { consumePasswordResetRateLimit } from "../lib/password-reset-rate-limit.ts";

function createDb() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE password_reset_requests (
      id TEXT PRIMARY KEY,
      email_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

test("Passwort-Reset begrenzt Anfragen je E-Mail neutral auf drei pro Stunde", () => {
  const db = createDb();
  for (let index = 0; index < 3; index += 1) {
    assert.equal(consumePasswordResetRateLimit(db, {
      email: "stefan@example.com",
      ip: `198.51.100.${index}`,
      now: new Date("2026-07-26T10:00:00.000Z"),
      generateId: () => `request-${index}`
    }), true);
  }
  assert.equal(consumePasswordResetRateLimit(db, {
    email: "STEFAN@example.com",
    ip: "198.51.100.4",
    now: new Date("2026-07-26T10:30:00.000Z"),
    generateId: () => "request-limited"
  }), false);
  db.close();
});

test("Passwort-Reset begrenzt wechselnde Konten je IP und gibt das Fenster wieder frei", () => {
  const db = createDb();
  for (let index = 0; index < 10; index += 1) {
    assert.equal(consumePasswordResetRateLimit(db, {
      email: `user-${index}@example.test`,
      ip: "198.51.100.10",
      now: new Date("2026-07-26T10:00:00.000Z"),
      generateId: () => `request-${index}`
    }), true);
  }
  assert.equal(consumePasswordResetRateLimit(db, {
    email: "blocked@example.test",
    ip: "198.51.100.10",
    now: new Date("2026-07-26T10:30:00.000Z"),
    generateId: () => "request-blocked"
  }), false);
  assert.equal(consumePasswordResetRateLimit(db, {
    email: "allowed@example.test",
    ip: "198.51.100.10",
    now: new Date("2026-07-26T11:01:00.000Z"),
    generateId: () => "request-new-window"
  }), true);
  db.close();
});
