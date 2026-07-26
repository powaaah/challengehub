import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteParticipationWriteRepository } from "../infrastructure/sqlite/sqlite-participation-write-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE challenges (id TEXT PRIMARY KEY, status TEXT NOT NULL);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      challenge_id TEXT NOT NULL REFERENCES challenges(id),
      started_at TEXT NOT NULL,
      status TEXT NOT NULL,
      completed_at TEXT,
      UNIQUE (user_id, challenge_id)
    );
    INSERT INTO users VALUES ('u1'), ('u2');
    INSERT INTO challenges VALUES ('published', 'published'), ('draft', 'draft');
  `);
  let id = 0;
  const repository = new SqliteParticipationWriteRepository(
    db,
    () => `participation-${++id}`,
    () => "2026-07-14T08:00:00.000Z"
  );
  return { db, repository };
}

test("Teilnahme-Repository startet eine veroeffentlichte Challenge genau einmal", () => {
  const { db, repository } = createRepository();
  const input = { userId: "u1", challengeId: "published" };

  assert.deepEqual(repository.startForUser(input), {
    status: "created",
    participationId: "participation-1"
  });
  assert.deepEqual(repository.startForUser(input), {
    status: "already_exists",
    participationId: "participation-1"
  });

  const rows = db
    .prepare("SELECT id, user_id as userId, challenge_id as challengeId, started_at as startedAt, status FROM participations")
    .all()
    .map((row) => ({ ...row }));
  assert.deepEqual(rows, [
    {
      id: "participation-1",
      userId: "u1",
      challengeId: "published",
      startedAt: "2026-07-14T08:00:00.000Z",
      status: "active"
    }
  ]);
  db.close();
});

test("Teilnahme-Repository lehnt nicht freigegebene Challenges und unbekannte Nutzer ab", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.startForUser({ userId: "u1", challengeId: "draft" }), {
    status: "challenge_not_available"
  });
  assert.deepEqual(repository.startForUser({ userId: "u1", challengeId: "missing" }), {
    status: "challenge_not_available"
  });
  assert.deepEqual(repository.startForUser({ userId: "missing", challengeId: "published" }), {
    status: "challenge_not_available"
  });
  assert.equal(db.prepare("SELECT COUNT(*) as count FROM participations").get()?.count, 0);
  db.close();
});

test("Teilnahme-Repository beendet die eigene aktive Teilnahme mit Zeitstempel", () => {
  const { db, repository } = createRepository();
  const participation = repository.startForUser({ userId: "u1", challengeId: "published" });
  assert.equal(participation.status, "created");

  assert.deepEqual(repository.leaveForUser({
    userId: "u1",
    participationId: participation.participationId
  }), { status: "left" });
  assert.deepEqual({ ...db.prepare(`
    SELECT status, completed_at AS completedAt
    FROM participations
    WHERE id = ?
  `).get(participation.participationId) }, {
    status: "cancelled",
    completedAt: "2026-07-14T08:00:00.000Z"
  });
  db.close();
});

test("Teilnahme-Repository schützt fremde Teilnahmen und beendet wiederholt idempotent", () => {
  const { db, repository } = createRepository();
  const participation = repository.startForUser({ userId: "u1", challengeId: "published" });
  assert.equal(participation.status, "created");

  assert.deepEqual(repository.leaveForUser({
    userId: "u2",
    participationId: participation.participationId
  }), { status: "not_found" });
  assert.equal(
    db.prepare("SELECT status FROM participations WHERE id = ?").get(participation.participationId)?.status,
    "active"
  );

  assert.deepEqual(repository.leaveForUser({
    userId: "u1",
    participationId: participation.participationId
  }), { status: "left" });
  assert.deepEqual(repository.leaveForUser({
    userId: "u1",
    participationId: participation.participationId
  }), { status: "already_inactive" });
  db.close();
});