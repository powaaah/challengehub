import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteChallengeParticipationStatsRepository } from "../infrastructure/sqlite/sqlite-challenge-participation-stats-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT NOT NULL);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL, status TEXT NOT NULL
    );
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY, participation_id TEXT NOT NULL, date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO users VALUES ('u1', 'Ada'), ('u2', 'Ben'), ('u3', 'Cleo');
    INSERT INTO challenges VALUES ('c1', 'schritte'), ('c2', 'lesen'), ('c3', 'leer');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'c1', '2026-07-10T10:00:00.000Z', 'active'),
      ('p2', 'u2', 'c1', '2026-07-11T10:00:00.000Z', 'completed'),
      ('p3', 'u3', 'c2', '2026-07-12T10:00:00.000Z', 'active');
    INSERT INTO check_ins VALUES
      ('i2', 'p1', '2026-07-12', '2026-07-12T18:30:00.000Z'),
      ('i1', 'p1', '2026-07-11', '2026-07-11T07:00:00.000Z'),
      ('i3', 'p2', '2026-07-13', '2026-07-13T09:15:00.000Z');
  `);
  return { db, repository: new SqliteChallengeParticipationStatsRepository(db) };
}

test("Statistik-Repository liefert echte Teilnahmezaehler je Challenge", () => {
  const { db, repository } = createRepository();

  assert.equal(repository.countByChallengeSlug("schritte"), 2);
  assert.equal(repository.countByChallengeSlug("unbekannt"), 0);
  assert.deepEqual(repository.listCountsByChallengeSlug(), {
    schritte: 2,
    lesen: 1,
    leer: 0
  });
  db.close();
});

test("Statistik-Repository liefert nur aktive Ranking-Kandidaten mit chronologischen Check-ins", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.listActiveRankingCandidates("schritte"), [
    {
      id: "p1",
      name: "Ada",
      startedAt: "2026-07-10T10:00:00.000Z",
      checkInDates: ["2026-07-11", "2026-07-12"]
    }
  ]);
  db.close();
});

test("Statistik-Repository liefert den neuesten echten Aktivitaetsfeed einer Challenge", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.listRecentCheckIns("schritte", 2), [
    {
      id: "i3",
      participantName: "Ben",
      checkInDate: "2026-07-13",
      createdAt: "2026-07-13T09:15:00.000Z"
    },
    {
      id: "i2",
      participantName: "Ada",
      checkInDate: "2026-07-12",
      createdAt: "2026-07-12T18:30:00.000Z"
    }
  ]);
  assert.deepEqual(repository.listRecentCheckIns("unbekannt", 10), []);
  db.close();
});