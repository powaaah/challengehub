import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqlitePublicChallengeRepository } from "../infrastructure/sqlite/sqlite-public-challenge-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY, creator_id TEXT NOT NULL, slug TEXT NOT NULL,
      title TEXT NOT NULL, level TEXT NOT NULL, category TEXT NOT NULL,
      duration_days INTEGER NOT NULL, goal TEXT NOT NULL, description TEXT NOT NULL,
      rules_json TEXT NOT NULL, tips_json TEXT NOT NULL, visibility TEXT NOT NULL,
      status TEXT NOT NULL, created_at TEXT NOT NULL,
      challenge_type TEXT NOT NULL, metric_unit TEXT NOT NULL, target_value REAL NOT NULL,
      frequency TEXT NOT NULL, measurement_direction TEXT NOT NULL,
      completion_criterion TEXT NOT NULL
    );
    INSERT INTO users VALUES ('u1', 'Ada');
    INSERT INTO challenges VALUES
      ('c1', 'u1', 'sichtbar', 'Sichtbar', 'Beginner', 'Fitness', 30, 'Ziel', 'Text',
       '["Regel"]', '["Tipp"]', 'public', 'published', '2026-07-12T12:00:00.000Z',
       'cumulative_metric', 'repetitions', 1000, 'challenge_period', 'at_least', 'cumulative_target'),
      ('c2', 'u1', 'entwurf', 'Entwurf', 'User', 'Fitness', 7, 'Ziel', 'Text',
       '[]', '[]', 'public', 'draft', '2026-07-12T13:00:00.000Z',
       'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in'),
      ('c3', 'u1', 'privat', 'Privat', 'User', 'Fitness', 7, 'Ziel', 'Text',
       '[]', '[]', 'private', 'published', '2026-07-12T14:00:00.000Z',
       'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in');
  `);
  return { db, repository: new SqlitePublicChallengeRepository(db) };
}

test("SQLite-Adapter liefert ausschließlich veröffentlichte öffentliche Challenges", async () => {
  const { db, repository } = createRepository();

  assert.deepEqual((await repository.listPublished()).map((challenge) => challenge.slug), ["sichtbar"]);
  assert.equal(await repository.findPublishedBySlug("entwurf"), null);
  assert.equal(await repository.findPublishedBySlug("privat"), null);
  db.close();
});

test("SQLite-Adapter bildet öffentliche Challenge-Daten in das Domainmodell ab", async () => {
  const { db, repository } = createRepository();
  const challenge = await repository.findPublishedBySlug("sichtbar");

  assert.ok(challenge);
  assert.equal(challenge.creatorName, "Ada");
  assert.deepEqual(challenge.rules, ["Regel"]);
  assert.deepEqual(challenge.tips, ["Tipp"]);
  assert.deepEqual(challenge.definition, {
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 1000,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  });
  db.close();
});
