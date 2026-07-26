import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqlitePasswordResetRepository } from "../infrastructure/sqlite/sqlite-password-reset-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT
    );
    INSERT INTO users VALUES ('u1', 'old-hash'), ('u2', 'other-hash');
    INSERT INTO sessions VALUES ('s1', 'u1'), ('s2', 'u2');
  `);
  const repository = new SqlitePasswordResetRepository(
    db,
    () => "2026-07-24T10:00:00.000Z"
  );
  return { db, repository };
}

test("Passwort-Reset-Repository speichert ausschließlich den Token-Hash für bekannte Nutzer", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.createForUser({
    id: "reset-1",
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-07-24T10:30:00.000Z"
  }), { status: "created" });
  assert.deepEqual(repository.createForUser({
    id: "reset-2",
    userId: "missing",
    tokenHash: "hash-2",
    expiresAt: "2026-07-24T10:30:00.000Z"
  }), { status: "user_not_found" });

  assert.deepEqual({ ...db.prepare(`
    SELECT user_id AS userId, token_hash AS tokenHash, expires_at AS expiresAt,
      created_at AS createdAt, used_at AS usedAt
    FROM password_reset_tokens
  `).get() }, {
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-07-24T10:30:00.000Z",
    createdAt: "2026-07-24T10:00:00.000Z",
    usedAt: null
  });
  db.close();
});

test("Passwort-Reset-Repository verbraucht ein gültiges Token atomar und beendet alle Sitzungen", () => {
  const { db, repository } = createRepository();
  repository.createForUser({
    id: "reset-1",
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-07-24T10:30:00.000Z"
  });

  assert.deepEqual(repository.resetPassword({
    tokenHash: "hash-1",
    passwordHash: "new-hash",
    now: "2026-07-24T10:15:00.000Z"
  }), { status: "reset" });
  assert.equal(db.prepare("SELECT password_hash FROM users WHERE id = 'u1'").get()?.password_hash, "new-hash");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE user_id = 'u1'").get()?.count, 0);
  assert.equal(db.prepare("SELECT used_at FROM password_reset_tokens WHERE id = 'reset-1'").get()?.used_at, "2026-07-24T10:15:00.000Z");
  db.close();
});

test("Passwort-Reset-Repository lehnt unbekannte, abgelaufene und bereits verwendete Tokens ab", () => {
  const { db, repository } = createRepository();
  repository.createForUser({
    id: "expired",
    userId: "u1",
    tokenHash: "expired-hash",
    expiresAt: "2026-07-24T10:05:00.000Z"
  });
  repository.createForUser({
    id: "used",
    userId: "u1",
    tokenHash: "used-hash",
    expiresAt: "2026-07-24T10:30:00.000Z"
  });
  db.prepare("UPDATE password_reset_tokens SET used_at = ? WHERE id = 'used'").run("2026-07-24T10:10:00.000Z");

  for (const tokenHash of ["missing", "expired-hash", "used-hash"]) {
    assert.deepEqual(repository.resetPassword({
      tokenHash,
      passwordHash: "attacker-hash",
      now: "2026-07-24T10:15:00.000Z"
    }), { status: "invalid_token" });
  }
  assert.equal(db.prepare("SELECT password_hash FROM users WHERE id = 'u1'").get()?.password_hash, "old-hash");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE user_id = 'u1'").get()?.count, 1);
  db.close();
});

test("ein neuer Reset-Link widerruft ältere offene Tokens desselben Nutzers", () => {
  const { db, repository } = createRepository();
  repository.createForUser({
    id: "reset-1",
    userId: "u1",
    tokenHash: "hash-1",
    expiresAt: "2026-07-24T10:30:00.000Z"
  });
  repository.confirmDelivery({
    id: "reset-1",
    userId: "u1",
    deliveredAt: "2026-07-24T10:00:00.000Z"
  });
  repository.createForUser({
    id: "reset-2",
    userId: "u1",
    tokenHash: "hash-2",
    expiresAt: "2026-07-24T10:30:00.000Z"
  });
  repository.confirmDelivery({
    id: "reset-2",
    userId: "u1",
    deliveredAt: "2026-07-24T10:01:00.000Z"
  });

  assert.deepEqual(repository.resetPassword({
    tokenHash: "hash-1",
    passwordHash: "attacker-hash",
    now: "2026-07-24T10:15:00.000Z"
  }), { status: "invalid_token" });
  assert.deepEqual(repository.resetPassword({
    tokenHash: "hash-2",
    passwordHash: "new-hash",
    now: "2026-07-24T10:15:00.000Z"
  }), { status: "reset" });
  db.close();
});

test("fehlgeschlagene Zustellung lässt den älteren Reset-Link gültig", () => {
  const { db, repository } = createRepository();
  repository.createForUser({ id: "reset-old", userId: "u1", tokenHash: "hash-old", expiresAt: "2026-07-24T10:30:00.000Z" });
  repository.confirmDelivery({ id: "reset-old", userId: "u1", deliveredAt: "2026-07-24T10:00:00.000Z" });
  repository.createForUser({ id: "reset-failed", userId: "u1", tokenHash: "hash-failed", expiresAt: "2026-07-24T10:30:00.000Z" });
  repository.discard({ id: "reset-failed", userId: "u1" });

  assert.deepEqual(repository.resetPassword({
    tokenHash: "hash-old",
    passwordHash: "new-hash",
    now: "2026-07-24T10:15:00.000Z"
  }), { status: "reset" });
  db.close();
});
