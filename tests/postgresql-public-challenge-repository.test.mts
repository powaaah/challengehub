import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  PostgresqlPublicChallengeRepository,
  type PostgresQueryClient
} from "../infrastructure/postgresql/postgresql-public-challenge-repository.ts";

const publishedRow = {
  id: "c1",
  creator_id: "u1",
  slug: "postgres-challenge",
  title: "PostgreSQL-Challenge",
  level: "Advanced",
  category: "Alltag",
  duration_days: 21,
  goal: "Ziel",
  description: "Beschreibung",
  rules_json: ["Regel"],
  tips_json: ["Tipp", 42],
  created_at: new Date("2026-07-16T10:00:00.000Z"),
  creator_name: "Ada",
  challenge_type: "one_time_result",
  metric_unit: "seconds",
  target_value: 1200,
  frequency: "once",
  measurement_direction: "at_most",
  completion_criterion: "single_result"
};

test("PostgreSQL-Adapter liest veröffentlichte Challenges asynchron und mappt JSONB", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return { rows: [publishedRow] };
    }
  };
  const repository = new PostgresqlPublicChallengeRepository(client);

  const challenges = await repository.listPublished();

  assert.equal(challenges[0].slug, "postgres-challenge");
  assert.equal(challenges[0].createdAt, "2026-07-16T10:00:00.000Z");
  assert.deepEqual(challenges[0].rules, ["Regel"]);
  assert.deepEqual(challenges[0].tips, ["Tipp"]);
  assert.deepEqual(challenges[0].definition, {
    type: "one_time_result",
    unit: "seconds",
    targetValue: 1200,
    frequency: "once",
    direction: "at_most",
    completionCriterion: "single_result"
  });
  assert.match(queries[0].text, /visibility = 'public'/);
  assert.match(queries[0].text, /status = 'published'/);
  assert.match(queries[0].text, /ORDER BY challenges\.created_at DESC/);
});

test("PostgreSQL-Adapter parametrisiert Slugs und liefert einen ehrlichen Leerzustand", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return { rows: [] };
    }
  };
  const repository = new PostgresqlPublicChallengeRepository(client);

  assert.equal(await repository.findPublishedBySlug("nicht-vorhanden"), null);
  assert.match(queries[0].text, /challenges\.slug = \$1/);
  assert.deepEqual(queries[0].values, ["nicht-vorhanden"]);
  assert.ok(!queries[0].text.includes("nicht-vorhanden"));
});
