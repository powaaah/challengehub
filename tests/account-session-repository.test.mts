import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteAccountSessionRepository } from "../infrastructure/sqlite/sqlite-account-session-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  const repository = new SqliteAccountSessionRepository(
    db,
    () => "2026-07-14T14:00:00.000Z"
  );
  return { db, repository };
}

const accountInput = {
  id: "u1",
  email: " Stefan@Example.COM ",
  name: "Stefan",
  passwordHash: "stored-password-hash"
};

test("Account-Repository normalisiert E-Mails und verhindert doppelte Accounts atomar", () => {
  const { db, repository } = createRepository();

  const created = repository.createAccount(accountInput);
  assert.equal(created.status, "created");
  assert.equal(created.status === "created" && created.account.email, "stefan@example.com");
  assert.equal(repository.findAccountByEmail("STEFAN@example.com")?.id, "u1");
  assert.deepEqual(
    repository.createAccount({ ...accountInput, id: "u2", email: "stefan@example.com" }),
    { status: "account_conflict" }
  );
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 1);
  db.close();
});

test("Account-Repository findet den Login case-insensitiv per E-Mail oder Benutzername", () => {
  const { db, repository } = createRepository();
  repository.createAccount(accountInput);

  assert.equal(repository.findAccountByLogin(" STEFAN@example.com ")?.id, "u1");
  assert.equal(repository.findAccountByLogin(" stefan ")?.id, "u1");
  assert.equal(repository.findAccountByLogin("unbekannt")?.id, undefined);
  db.close();
});

test("Account-Repository verhindert doppelte Benutzernamen case-insensitiv", () => {
  const { db, repository } = createRepository();
  repository.createAccount(accountInput);

  assert.deepEqual(
    repository.createAccount({
      ...accountInput,
      id: "u2",
      email: "andere@example.com",
      name: " stefan "
    }),
    { status: "account_conflict" }
  );
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 1);
  db.close();
});

test("Session-Repository erstellt nur Sessions fuer bekannte Accounts und liest nur gueltige Sessions", () => {
  const { db, repository } = createRepository();
  repository.createAccount(accountInput);

  assert.deepEqual(
    repository.createSession({
      id: "s1",
      userId: "u1",
      tokenHash: "token-1",
      expiresAt: "2026-08-01T00:00:00.000Z"
    }),
    { status: "created" }
  );
  assert.equal(
    repository.findAccountBySessionTokenHash("token-1", "2026-07-31T23:59:59.000Z")?.id,
    "u1"
  );
  assert.equal(
    repository.findAccountBySessionTokenHash("token-1", "2026-08-01T00:00:00.000Z"),
    null
  );
  assert.deepEqual(
    repository.createSession({
      id: "s2",
      userId: "missing",
      tokenHash: "token-2",
      expiresAt: "2026-08-01T00:00:00.000Z"
    }),
    { status: "user_not_found" }
  );
  db.close();
});

test("Session-Repository behandelt Token-Kollisionen und Logout idempotent", () => {
  const { db, repository } = createRepository();
  repository.createAccount(accountInput);
  const session = {
    id: "s1",
    userId: "u1",
    tokenHash: "same-token",
    expiresAt: "2026-08-01T00:00:00.000Z"
  };

  assert.deepEqual(repository.createSession(session), { status: "created" });
  assert.deepEqual(repository.createSession({ ...session, id: "s2" }), {
    status: "token_conflict"
  });
  assert.equal(repository.deleteSessionByTokenHash("same-token"), true);
  assert.equal(repository.deleteSessionByTokenHash("same-token"), false);
  db.close();
});
