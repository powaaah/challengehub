import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { ensureEmailVerificationSchema } from "../infrastructure/sqlite/sqlite-email-verification-migration.ts";

test("E-Mail-Verifikationsmigration ergänzt Status, Einmal-Tokens und bleibt idempotent", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL,
      name_key TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL
    );
  `);

  ensureEmailVerificationSchema(db);
  ensureEmailVerificationSchema(db);

  const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  assert.ok(userColumns.some((column) => column.name === "email_verified_at"));
  const tokenColumns = db.prepare("PRAGMA table_info(email_verification_tokens)").all() as Array<{ name: string }>;
  assert.deepEqual(tokenColumns.map((column) => column.name), [
    "id", "user_id", "token_hash", "expires_at", "created_at", "used_at"
  ]);
  db.close();
});
