import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteChallengeWriteRepository } from "../infrastructure/sqlite/sqlite-challenge-write-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY);
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES users(id),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      goal TEXT NOT NULL,
      description TEXT NOT NULL,
      rules_json TEXT NOT NULL,
      tips_json TEXT NOT NULL,
      visibility TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      metric_unit TEXT NOT NULL,
      target_value REAL NOT NULL,
      frequency TEXT NOT NULL,
      measurement_direction TEXT NOT NULL,
      completion_criterion TEXT NOT NULL
    );
    INSERT INTO users VALUES ('u1');
  `);
  const repository = new SqliteChallengeWriteRepository(
    db,
    () => "2026-07-14T12:00:00.000Z"
  );
  return { db, repository };
}

const input = {
  id: "challenge-1",
  creatorId: "u1",
  slug: "morgenroutine",
  title: "Morgenroutine",
  level: "User" as const,
  category: "Mindset",
  durationDays: 30,
  goal: "Jeden Morgen bewusst starten",
  description: "Eine einfache Morgenroutine fuer einen klaren Tagesbeginn.",
  rules: ["Direkt nach dem Aufstehen starten"],
  tips: ["Am Vorabend vorbereiten"],
  definition: {
    type: "cumulative_metric" as const,
    unit: "repetitions" as const,
    targetValue: 1000,
    frequency: "challenge_period" as const,
    direction: "at_least" as const,
    completionCriterion: "cumulative_target" as const
  }
};

test("Challenge-Write-Repository legt neue Community-Challenges moderationspflichtig an", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.createPending(input), {
    status: "created",
    slug: "morgenroutine"
  });
  assert.deepEqual(repository.listSlugs(), ["morgenroutine"]);
  assert.deepEqual(repository.listPublishedChallenges(), []);

  const row = db.prepare("SELECT * FROM challenges WHERE id = ?").get(input.id) as Record<string, unknown>;
  assert.equal(row.creator_id, "u1");
  assert.equal(row.visibility, "public");
  assert.equal(row.status, "pending");
  assert.equal(row.created_at, "2026-07-14T12:00:00.000Z");
  assert.deepEqual(JSON.parse(String(row.rules_json)), input.rules);
  assert.deepEqual(JSON.parse(String(row.tips_json)), input.tips);
  assert.equal(row.challenge_type, input.definition.type);
  assert.equal(row.metric_unit, input.definition.unit);
  assert.equal(row.target_value, input.definition.targetValue);
  assert.equal(row.completion_criterion, input.definition.completionCriterion);
  db.close();
});

test("Challenge-Write-Repository lehnt Slug-Kollisionen und unbekannte Ersteller ab", () => {
  const { db, repository } = createRepository();
  assert.equal(repository.createPending(input).status, "created");

  assert.deepEqual(
    repository.createPending({ ...input, id: "challenge-2" }),
    { status: "slug_conflict" }
  );
  assert.deepEqual(
    repository.createPending({
      ...input,
      id: "challenge-3",
      creatorId: "missing",
      slug: "anderer-slug"
    }),
    { status: "creator_not_found" }
  );
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM challenges").get()?.count, 1);
  db.close();
});
