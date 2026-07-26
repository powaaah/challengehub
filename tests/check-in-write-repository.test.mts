import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE participations (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, status TEXT NOT NULL);
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      UNIQUE (participation_id, date)
    );
    INSERT INTO participations VALUES ('p1', 'u1', 'active'), ('p2', 'u2', 'active'), ('p3', 'u1', 'cancelled');
  `);
  let id = 0;
  const repository = new SqliteCheckInWriteRepository(
    db,
    () => `check-in-${++id}`,
    () => "2026-07-13T12:00:00.000Z"
  );
  return { db, repository };
}

test("Check-in-Repository schreibt nur fuer die eigene Teilnahme", () => {
  const { db, repository } = createRepository();

  assert.equal(
    repository.createForUser({ participationId: "p2", userId: "u1", date: "2026-07-13" }),
    "participation_not_found"
  );
  assert.equal(
    repository.createForUser({ participationId: "unbekannt", userId: "u1", date: "2026-07-13" }),
    "participation_not_found"
  );
  assert.equal(db.prepare("SELECT COUNT(*) as count FROM check_ins").get()?.count, 0);
  db.close();
});

test("Check-in-Repository legt denselben Tag idempotent nur einmal an", () => {
  const { db, repository } = createRepository();
  const input = { participationId: "p1", userId: "u1", date: "2026-07-13" };

  assert.equal(repository.createForUser(input), "created");
  assert.equal(repository.createForUser(input), "already_exists");
  const rows = db.prepare("SELECT participation_id, date, created_at FROM check_ins").all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.participation_id, "p1");
  assert.equal(rows[0]?.date, "2026-07-13");
  assert.equal(rows[0]?.created_at, "2026-07-13T12:00:00.000Z");
  db.close();
});

test("Check-in-Repository lehnt Check-ins für beendete Teilnahmen ab", () => {
  const { db, repository } = createRepository();

  assert.equal(
    repository.createForUser({ participationId: "p3", userId: "u1", date: "2026-07-13" }),
    "participation_not_found"
  );
  assert.equal(db.prepare("SELECT COUNT(*) as count FROM check_ins").get()?.count, 0);
  db.close();
});