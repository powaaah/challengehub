import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { ensureChallengeTypes } from "../infrastructure/sqlite/sqlite-challenge-types-migration.ts";

test("SQLite-Migration typisiert bestehende Challenges deterministisch und bleibt idempotent", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT NOT NULL);
    CREATE TABLE check_ins (id TEXT PRIMARY KEY, participation_id TEXT, date TEXT);
    INSERT INTO challenges VALUES
      ('c1', '10000-schritte-am-tag'),
      ('c2', '1000-liegestuetze-challenge'),
      ('c3', 'marathon-unter-3-stunden'),
      ('c4', 'community-alt');
    INSERT INTO check_ins VALUES ('i1', 'p1', '2026-08-09');
  `);

  ensureChallengeTypes(db);
  ensureChallengeTypes(db);

  const definitions = db.prepare(`
    SELECT slug, challenge_type AS type, metric_unit AS unit, target_value AS targetValue,
           frequency, measurement_direction AS direction,
           completion_criterion AS completionCriterion
    FROM challenges ORDER BY id
  `).all().map((row) => ({ ...row }));
  assert.deepEqual(definitions, [
    {
      slug: "10000-schritte-am-tag",
      type: "daily_boolean",
      unit: "completion",
      targetValue: 1,
      frequency: "daily",
      direction: "at_least",
      completionCriterion: "daily_check_in"
    },
    {
      slug: "1000-liegestuetze-challenge",
      type: "cumulative_metric",
      unit: "repetitions",
      targetValue: 1000,
      frequency: "challenge_period",
      direction: "at_least",
      completionCriterion: "cumulative_target"
    },
    {
      slug: "marathon-unter-3-stunden",
      type: "one_time_result",
      unit: "seconds",
      targetValue: 10800,
      frequency: "once",
      direction: "at_most",
      completionCriterion: "single_result"
    },
    {
      slug: "community-alt",
      type: "daily_boolean",
      unit: "completion",
      targetValue: 1,
      frequency: "daily",
      direction: "at_least",
      completionCriterion: "daily_check_in"
    }
  ]);
  assert.equal(db.prepare("SELECT value FROM check_ins").get()?.value, null);
  db.close();
});
