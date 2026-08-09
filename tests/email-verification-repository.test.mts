import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteEmailVerificationRepository } from "../infrastructure/sqlite/sqlite-email-verification-repository.ts";

function createDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      email_verified_at TEXT
    );
    CREATE TABLE email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (expires_at > created_at)
    );
    INSERT INTO users VALUES
      ('u1', 'neu@example.test', 'Neu', 'neu', 'hash', '2026-08-09T10:00:00.000Z', NULL),
      ('u2', 'fertig@example.test', 'Fertig', 'fertig', 'hash', '2026-08-09T10:00:00.000Z', '2026-08-09T10:05:00.000Z');
  `);
  return db;
}

test("Verifikations-Repository speichert nur den Token-Hash für unverifizierte Konten", () => {
  const db = createDb();
  const repository = new SqliteEmailVerificationRepository(db, () => "2026-08-09T10:10:00.000Z");

  assert.deepEqual(repository.createForUser({
    id: "verify-1",
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-08-09T10:40:00.000Z"
  }), { status: "created" });
  assert.deepEqual(repository.createForUser({
    id: "verify-2",
    userId: "u2",
    tokenHash: "hash-2",
    expiresAt: "2026-08-09T10:40:00.000Z"
  }), { status: "already_verified" });

  assert.deepEqual(db.prepare(`
    SELECT user_id AS userId, token_hash AS tokenHash, expires_at AS expiresAt,
      created_at AS createdAt, used_at AS usedAt
    FROM email_verification_tokens
  `).all().map((row) => ({ ...row })), [{
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-08-09T10:40:00.000Z",
    createdAt: "2026-08-09T10:10:00.000Z",
    usedAt: null
  }]);
  db.close();
});

test("erst nach erfolgreicher Zustellung ersetzt ein neuer Link ältere aktive Links", () => {
  const db = createDb();
  const repository = new SqliteEmailVerificationRepository(db, () => "2026-08-09T10:10:00.000Z");
  repository.createForUser({ id: "old", userId: "u1", tokenHash: "old-hash", expiresAt: "2026-08-09T10:40:00.000Z" });
  repository.createForUser({ id: "new", userId: "u1", tokenHash: "new-hash", expiresAt: "2026-08-09T10:40:00.000Z" });

  repository.confirmDelivery({ id: "new", userId: "u1", deliveredAt: "2026-08-09T10:11:00.000Z" });

  assert.equal(db.prepare("SELECT used_at FROM email_verification_tokens WHERE id = 'old'").get()?.used_at, "2026-08-09T10:11:00.000Z");
  assert.equal(db.prepare("SELECT used_at FROM email_verification_tokens WHERE id = 'new'").get()?.used_at, null);
  db.close();
});

test("gültiger Link verifiziert das Konto atomar genau einmal, abgelaufene Links bleiben wirkungslos", () => {
  const db = createDb();
  const repository = new SqliteEmailVerificationRepository(db, () => "2026-08-09T10:10:00.000Z");
  repository.createForUser({ id: "valid", userId: "u1", tokenHash: "valid-hash", expiresAt: "2026-08-09T10:40:00.000Z" });

  assert.deepEqual(repository.verifyEmail({ tokenHash: "valid-hash", now: "2026-08-09T10:20:00.000Z" }), { status: "verified" });
  assert.equal(db.prepare("SELECT email_verified_at FROM users WHERE id = 'u1'").get()?.email_verified_at, "2026-08-09T10:20:00.000Z");
  assert.deepEqual(repository.verifyEmail({ tokenHash: "valid-hash", now: "2026-08-09T10:21:00.000Z" }), { status: "invalid_token" });

  db.prepare("UPDATE users SET email_verified_at = NULL WHERE id = 'u1'").run();
  repository.createForUser({ id: "expired", userId: "u1", tokenHash: "expired-hash", expiresAt: "2026-08-09T10:30:00.000Z" });
  assert.deepEqual(repository.verifyEmail({ tokenHash: "expired-hash", now: "2026-08-09T10:31:00.000Z" }), { status: "invalid_token" });
  assert.equal(db.prepare("SELECT email_verified_at FROM users WHERE id = 'u1'").get()?.email_verified_at, null);
  db.close();
});
