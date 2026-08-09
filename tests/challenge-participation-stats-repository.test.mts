import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteChallengeParticipationStatsRepository } from "../infrastructure/sqlite/sqlite-challenge-participation-stats-repository.ts";
import { ensureAccountPrivacySchema } from "../infrastructure/sqlite/sqlite-account-privacy-migration.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL, challenge_type TEXT NOT NULL,
      metric_unit TEXT NOT NULL, target_value REAL NOT NULL, frequency TEXT NOT NULL,
      measurement_direction TEXT NOT NULL, completion_criterion TEXT NOT NULL
    );
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL, status TEXT NOT NULL
    );
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY, participation_id TEXT NOT NULL, date TEXT NOT NULL,
      value REAL, created_at TEXT NOT NULL
    );
    INSERT INTO users VALUES ('u1', 'Ada'), ('u2', 'Ben'), ('u3', 'Cleo');
    INSERT INTO challenges VALUES
      ('c1', 'schritte', 'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in'),
      ('c2', 'lesen', 'cumulative_metric', 'repetitions', 100, 'challenge_period', 'at_least', 'cumulative_target'),
      ('c3', 'leer', 'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'c1', '2026-07-10T10:00:00.000Z', 'active'),
      ('p2', 'u2', 'c1', '2026-07-11T10:00:00.000Z', 'completed'),
      ('p3', 'u3', 'c2', '2026-07-12T10:00:00.000Z', 'active'),
      ('p4', 'u1', 'c2', '2026-07-10T10:00:00.000Z', 'completed');
    INSERT INTO check_ins VALUES
      ('i2', 'p1', '2026-07-12', NULL, '2026-07-12T18:30:00.000Z'),
      ('i1', 'p1', '2026-07-11', NULL, '2026-07-11T07:00:00.000Z'),
      ('i3', 'p2', '2026-07-13', NULL, '2026-07-13T09:15:00.000Z'),
      ('i4', 'p3', '2026-07-13', 20, '2026-07-13T10:00:00.000Z'),
      ('i5', 'p4', '2026-07-12', 80, '2026-07-12T10:00:00.000Z');
  `);
  ensureAccountPrivacySchema(db);
  db.exec(`
    INSERT INTO account_privacy_preferences (
      user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
    ) VALUES
      ('u1', 1, 1, 0, '2026-08-09T10:00:00.000Z'),
      ('u2', 0, 0, 0, '2026-08-09T10:00:00.000Z'),
      ('u3', 0, 0, 0, '2026-08-09T10:00:00.000Z');
  `);
  return { db, repository: new SqliteChallengeParticipationStatsRepository(db) };
}

test("Statistik-Repository liefert echte Teilnahmezaehler je Challenge", () => {
  const { db, repository } = createRepository();

  assert.equal(repository.countByChallengeSlug("schritte"), 2);
  assert.equal(repository.countByChallengeSlug("unbekannt"), 0);
  assert.deepEqual(repository.listCountsByChallengeSlug(), {
    schritte: 2,
    lesen: 2,
    leer: 0
  });
  db.close();
});

test("Messwert-Rankings behalten fachlich abgeschlossene Teilnahmen", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(
    repository.listActiveRankingCandidates("lesen").map((candidate) => candidate.id),
    ["p4", "p3"]
  );
  db.close();
});

test("Statistik-Repository liefert nur aktive Ranking-Kandidaten mit chronologischen Check-ins", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.listActiveRankingCandidates("schritte"), [
    {
      id: "p1",
      name: "Ada",
      startedAt: "2026-07-10T10:00:00.000Z",
      checkIns: [
        { date: "2026-07-11", value: null },
        { date: "2026-07-12", value: null }
      ],
      definition: {
        type: "daily_boolean",
        unit: "completion",
        targetValue: 1,
        frequency: "daily",
        direction: "at_least",
        completionCriterion: "daily_check_in"
      }
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
      value: null,
      createdAt: "2026-07-13T09:15:00.000Z"
    },
    {
      id: "i2",
      participantName: "Ada",
      checkInDate: "2026-07-12",
      value: null,
      createdAt: "2026-07-12T18:30:00.000Z"
    }
  ]);
  assert.deepEqual(repository.listRecentCheckIns("unbekannt", 10), []);
  db.close();
});

test("öffentliche Rankings und Aktivitäten respektieren getrennte Privacy-Opt-ins", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(
    repository.listActiveRankingCandidates("lesen", { publicOnly: true }).map((candidate) => candidate.id),
    ["p4"]
  );
  assert.deepEqual(
    repository.listRecentCheckIns("schritte", 10, { publicOnly: true }).map((entry) => entry.id),
    ["i2", "i1"]
  );
  db.close();
});
