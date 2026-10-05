import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { PostgresQueryClient } from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlChallengeParticipationStatsRepository } from "../infrastructure/postgresql/postgresql-challenge-participation-stats-repository.ts";

const definition = {
  challenge_type: "daily_boolean",
  metric_unit: "completion",
  target_value: 1,
  frequency: "daily",
  measurement_direction: "at_least",
  completion_criterion: "daily_check_in"
};

test("PostgreSQL-Statistikadapter mappt Zähler einschließlich leerer Challenges", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return text.includes("GROUP BY")
        ? { rows: [{ slug: "schritte", count: "2" }, { slug: "leer", count: "0" }] }
        : { rows: [{ count: "2" }] };
    }
  };
  const repository = new PostgresqlChallengeParticipationStatsRepository(client);

  assert.equal(await repository.countByChallengeSlug("schritte"), 2);
  assert.deepEqual(await repository.listCountsByChallengeSlug(), { schritte: 2, leer: 0 });
  assert.deepEqual(queries[0].values, ["schritte"]);
  assert.match(queries[0].text, /challenges\.slug = \$1/);
  assert.ok(!queries[0].text.includes("schritte"));
});

test("PostgreSQL-Statistikadapter gruppiert Ranking-Check-ins und bindet Privacy-Opt-in", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return { rows: [
        { id: "p1", started_at: new Date("2026-08-30T10:00:00.000Z"), name: "Ada", check_in_date: "2026-08-31", check_in_value: null, ...definition },
        { id: "p1", started_at: new Date("2026-08-30T10:00:00.000Z"), name: "Ada", check_in_date: new Date("2026-09-01T00:00:00.000Z"), check_in_value: null, ...definition }
      ] };
    }
  };
  const repository = new PostgresqlChallengeParticipationStatsRepository(client);

  const candidates = await repository.listActiveRankingCandidates("schritte", { publicOnly: true });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].startedAt, "2026-08-30T10:00:00.000Z");
  assert.deepEqual(candidates[0].checkIns, [
    { date: "2026-08-31", value: null },
    { date: "2026-09-01", value: null }
  ]);
  assert.deepEqual(queries[0].values, ["schritte", true]);
  assert.match(queries[0].text, /privacy\.ranking_visible/);
  assert.match(queries[0].text, /participations\.status = 'completed'/);
});

test("PostgreSQL-Statistikadapter begrenzt Aktivität und mappt Zeittypen", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return { rows: [{
        id: "i1", participant_name: "Ada", check_in_date: new Date("2026-09-01T00:00:00.000Z"),
        value: 12345, created_at: new Date("2026-09-01T10:00:00.000Z")
      }] };
    }
  };
  const repository = new PostgresqlChallengeParticipationStatsRepository(client);

  assert.deepEqual(await repository.listRecentCheckIns("schritte", 99, { publicOnly: true }), [{
    id: "i1", participantName: "Ada", checkInDate: "2026-09-01", value: 12345,
    createdAt: "2026-09-01T10:00:00.000Z"
  }]);
  assert.deepEqual(queries[0].values, ["schritte", true, 20]);
  assert.match(queries[0].text, /privacy\.activity_visible/);
  assert.match(queries[0].text, /LIMIT \$3/);
  assert.ok(!queries[0].text.includes("schritte"));
});