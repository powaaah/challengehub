import * as assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { consumeRateLimit, resolveRateLimitSecret } from "../domain/security/rate-limit.ts";

function createDb() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE rate_limit_events (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

test("Rate-Limit begrenzt einen Schlüssel atomar innerhalb seines Fensters", () => {
  const db = createDb();
  const base = {
    scope: "login:identifier",
    identifier: "stefan@example.com",
    limit: 2,
    windowMs: 60_000,
    now: new Date("2026-07-28T09:00:00.000Z"),
    secret: "rate-limit-test-secret"
  };

  assert.equal(consumeRateLimit(db, { ...base, generateId: () => "event-1" }), true);
  assert.equal(consumeRateLimit(db, { ...base, generateId: () => "event-2" }), true);
  assert.equal(consumeRateLimit(db, { ...base, generateId: () => "event-3" }), false);
  assert.equal(consumeRateLimit(db, {
    ...base,
    now: new Date("2026-07-28T09:01:01.000Z"),
    generateId: () => "event-4"
  }), true);
  db.close();
});

test("Rate-Limit trennt Scopes und speichert ausschließlich geheimnisgebundene Schlüssel", () => {
  const db = createDb();
  const secret = "rate-limit-test-secret";
  const identifier = "198.51.100.10";

  assert.equal(consumeRateLimit(db, {
    scope: "login:ip",
    identifier,
    limit: 1,
    windowMs: 60_000,
    now: new Date("2026-07-28T09:00:00.000Z"),
    secret,
    generateId: () => "event-login"
  }), true);
  assert.equal(consumeRateLimit(db, {
    scope: "register:ip",
    identifier,
    limit: 1,
    windowMs: 60_000,
    now: new Date("2026-07-28T09:00:00.000Z"),
    secret,
    generateId: () => "event-register"
  }), true);

  const rows = db.prepare("SELECT scope, key_hash AS keyHash FROM rate_limit_events ORDER BY scope").all() as Array<{
    scope: string;
    keyHash: string;
  }>;
  assert.deepEqual(rows.map((row) => row.scope), ["login:ip", "register:ip"]);
  assert.ok(rows.every((row) => row.keyHash === createHmac("sha256", secret).update(identifier).digest("hex")));
  assert.ok(rows.every((row) => row.keyHash !== createHash("sha256").update(identifier).digest("hex")));
  db.close();
});

test("Rate-Limit entfernt global abgelaufene Ereignisse unbekannter Schlüssel", () => {
  const db = createDb();
  db.prepare(`
    INSERT INTO rate_limit_events (id, scope, key_hash, created_at)
    VALUES (?, ?, ?, ?), (?, ?, ?, ?)
  `).run(
    "stale", "login:identifier", "old-key", "2026-07-27T08:59:59.000Z",
    "recent", "register:ip", "recent-key", "2026-07-28T08:30:00.000Z"
  );

  assert.equal(consumeRateLimit(db, {
    scope: "login:ip",
    identifier: "198.51.100.20",
    limit: 2,
    windowMs: 60_000,
    retentionMs: 24 * 60 * 60 * 1_000,
    now: new Date("2026-07-28T09:00:00.000Z"),
    secret: "rate-limit-test-secret",
    generateId: () => "current"
  }), true);

  const ids = db.prepare("SELECT id FROM rate_limit_events ORDER BY id").all() as Array<{ id: string }>;
  assert.deepEqual(ids.map(({ id }) => id), ["current", "recent"]);
  db.close();
});

test("Produktion startet Rate-Limits nicht mit einem flüchtigen Ersatzschlüssel", () => {
  assert.throws(
    () => resolveRateLimitSecret({ nodeEnv: "production", configuredSecret: "", fallbackSecret: "fallback" }),
    /RATE_LIMIT_SECRET/
  );
  assert.equal(resolveRateLimitSecret({
    nodeEnv: "production",
    configuredSecret: "configured-secret",
    fallbackSecret: "fallback"
  }), "configured-secret");
  assert.equal(resolveRateLimitSecret({
    nodeEnv: "development",
    configuredSecret: "",
    fallbackSecret: "fallback"
  }), "fallback");
});
