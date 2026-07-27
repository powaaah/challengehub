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
      ('u3', 'drei@example.com', '   ', 'hash', '2026-01-04'),
      ('u5', 'fuenf@example.com', 'Änne', 'hash', '2026-01-05'),
      ('u6', 'sechs@example.com', 'änne', 'hash', '2026-01-06');
  `);

  ensureUniqueUsernames(db);
  ensureUniqueUsernames(db);

  const names = db.prepare("SELECT name FROM users ORDER BY id").all() as Array<{ name: string }>;
  assert.deepEqual(names.map((entry) => entry.name), [
    "Stefan",
    "stefan-u2",
    "user-u3",
    "stefan-u2-u4",
    "Änne",
    "änne-u6"
  ]);
  assert.throws(() => {
    db.prepare(`
      INSERT INTO users (id, email, name, name_key, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      "u7",
      "sieben@example.com",
      "STEFAN",
      "stefan",
      "hash",
      "2026-01-07"
    );
  }, /UNIQUE constraint failed/);
  assert.throws(() => {
    db.prepare(`
      INSERT INTO users (id, email, name, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run("u8", "acht@example.com", "Acht", "hash", "2026-01-08");
  }, /name_key/);
  db.close();
});

test("SQLite-Migration aktualisiert bestehende Namensschlüssel auf die aktuelle Unicode-Faltung", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_key TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX users_name_unique_idx ON users (name_key);
    INSERT INTO users VALUES
      ('u1', 'eins@example.com', 'οσ', 'οσ', 'hash', '2026-01-01'),
      ('u2', 'zwei@example.com', 'ος', 'ος', 'hash', '2026-01-02');
  `);

  ensureUniqueUsernames(db);

  const users = db.prepare("SELECT name, name_key AS nameKey FROM users ORDER BY id").all() as Array<{
    name: string;
    nameKey: string;
  }>;
  assert.deepEqual(users.map((user) => ({ ...user })), [
    { name: "οσ", nameKey: "ος" },
    { name: "ος-u2", nameKey: "ος-u2" }
  ]);
  db.close();
});
