import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY, challenge_type TEXT NOT NULL, target_value REAL NOT NULL,
      measurement_direction TEXT NOT NULL, completion_criterion TEXT NOT NULL
    );
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, challenge_id TEXT NOT NULL,
      status TEXT NOT NULL, completed_at TEXT
    );
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value REAL,
      note TEXT,
      created_at TEXT NOT NULL,
      UNIQUE (participation_id, date)
    );
    INSERT INTO challenges VALUES
      ('daily', 'daily_boolean', 1, 'at_least', 'daily_check_in'),
      ('cumulative', 'cumulative_metric', 100, 'at_least', 'cumulative_target'),
      ('result', 'one_time_result', 120, 'at_most', 'single_result');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'daily', 'active', NULL),
      ('p2', 'u2', 'daily', 'active', NULL),
      ('p3', 'u1', 'daily', 'cancelled', NULL),
      ('p4', 'u1', 'cumulative', 'active', NULL),
      ('p5', 'u1', 'result', 'active', NULL);
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
  const rows = db.prepare("SELECT participation_id, date, value, created_at FROM check_ins").all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.participation_id, "p1");
  assert.equal(rows[0]?.date, "2026-07-13");
  assert.equal(rows[0]?.value, null);
  assert.equal(rows[0]?.created_at, "2026-07-13T12:00:00.000Z");
  db.close();
});

test("Check-in-Repository verlangt für Mess-Challenges einen positiven Zahlenwert", () => {
  const { db, repository } = createRepository();

  assert.equal(
    repository.createForUser({ participationId: "p4", userId: "u1", date: "2026-07-13" }),
    "invalid_value"
  );
  assert.equal(
    repository.createForUser({ participationId: "p5", userId: "u1", date: "2026-07-13", value: 0 }),
    "invalid_value"
  );
  assert.equal(
    repository.createForUser({ participationId: "p4", userId: "u1", date: "2026-07-13", value: 125.5 }),
    "created"
  );
  assert.equal(db.prepare("SELECT value FROM check_ins WHERE participation_id = 'p4'").get()?.value, 125.5);
  assert.deepEqual(
    { ...db.prepare("SELECT status, completed_at AS completedAt FROM participations WHERE id = 'p4'").get() },
    { status: "completed", completedAt: "2026-07-13T12:00:00.000Z" }
  );
  db.close();
});

test("einmalige Ergebnisse schließen erst bei erfüllter Messrichtung ab", () => {
  const { db, repository } = createRepository();

  assert.equal(repository.createForUser({
    participationId: "p5", userId: "u1", date: "2026-07-13", value: 125
  }), "created");
  assert.equal(db.prepare("SELECT status FROM participations WHERE id = 'p5'").get()?.status, "active");
  assert.equal(repository.createForUser({
    participationId: "p5", userId: "u1", date: "2026-07-14", value: 115
  }), "created");
  assert.equal(db.prepare("SELECT status FROM participations WHERE id = 'p5'").get()?.status, "completed");
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
