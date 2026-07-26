import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { ensureUniqueUsernames } from "../infrastructure/sqlite/sqlite-usernames-migration.ts";

test("SQLite-Migration bereinigt Bestandsnamen und erzwingt eindeutige Benutzernamen", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO users VALUES
      ('u1', 'eins@example.com', 'Stefan', 'hash', '2026-01-01'),
      ('u2', 'zwei@example.com', ' stefan ', 'hash', '2026-01-02'),
      ('u4', 'vier@example.com', 'stefan-u2', 'hash', '2026-01-03'),
      ('u3', 'drei@example.com', '   ', 'hash', '2026-01-04');
  `);

  ensureUniqueUsernames(db);

  const names = db.prepare("SELECT name FROM users ORDER BY id").all() as Array<{ name: string }>;
  assert.deepEqual(names.map((entry) => entry.name), [
    "Stefan",
    "stefan-u2",
    "user-u3",
    "stefan-u2-u4"
  ]);
  assert.throws(() => {
    db.prepare("INSERT INTO users VALUES (?, ?, ?, ?, ?)").run(
      "u5",
      "fuenf@example.com",
      "STEFAN",
      "hash",
      "2026-01-05"
    );
  }, /UNIQUE constraint failed/);
  db.close();
});
