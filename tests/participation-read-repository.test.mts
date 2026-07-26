import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteParticipationReadRepository } from "../infrastructure/sqlite/sqlite-participation-read-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT, title TEXT, goal TEXT);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT, challenge_id TEXT, started_at TEXT,
      status TEXT, completed_at TEXT
    );
    CREATE TABLE check_ins (id TEXT PRIMARY KEY, participation_id TEXT, date TEXT);
    INSERT INTO challenges VALUES ('c1', 'schritte', '10.000 Schritte', 'Täglich gehen');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'c1', '2026-07-10T10:00:00.000Z', 'active', NULL),
      ('p2', 'u2', 'c1', '2026-07-11T10:00:00.000Z', 'active', NULL);
    INSERT INTO check_ins VALUES
      ('i2', 'p1', '2026-07-12'),
      ('i1', 'p1', '2026-07-11'),
      ('i3', 'p2', '2026-07-13');
  `);
  return { db, repository: new SqliteParticipationReadRepository(db) };
}

test("Teilnahme-Repository begrenzt Listen- und Detailzugriff auf den Nutzer", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.listForUser("u1").map((item) => item.id), ["p1"]);
  assert.equal(repository.findByIdForUser("p2", "u1"), null);
  assert.equal(repository.findByIdForUser("p1", "u1")?.challengeSlug, "schritte");
  db.close();
});

test("Teilnahme-Repository liefert nur eigene Check-ins chronologisch", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.listCheckInDatesForUser("p1", "u1"), ["2026-07-11", "2026-07-12"]);
  assert.deepEqual(repository.listCheckInDatesForUser("p2", "u1"), []);
  db.close();
});