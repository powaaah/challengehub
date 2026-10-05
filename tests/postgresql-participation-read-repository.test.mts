import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  PostgresqlParticipationReadRepository
} from "../infrastructure/postgresql/postgresql-participation-read-repository.ts";
import type { PostgresQueryClient } from "../infrastructure/postgresql/postgres-query-client.ts";

const participationRow = {
  id: "p1",
  user_id: "u1",
  challenge_id: "c1",
  started_at: new Date("2026-09-01T08:00:00.000Z"),
  status: "active",
  completed_at: null,
  challenge_slug: "schritte",
  challenge_title: "10 000 Schritte am Tag Challenge",
  challenge_goal: "Täglich 10 000 Schritte gehen",
  challenge_type: "daily_boolean",
  metric_unit: "completion",
  target_value: 1,
  frequency: "daily",
  measurement_direction: "at_least",
  completion_criterion: "daily_check_in"
};

test("PostgreSQL-Teilnahmeadapter mappt eigene Teilnahmen und parametrisiert Nutzerzugriffe", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      if (text.includes("participations.id = $1")) {
        return { rows: values?.[0] === "p1" && values?.[1] === "u1" ? [participationRow] : [] };
      }
      return { rows: [participationRow] };
    }
  };
  const repository = new PostgresqlParticipationReadRepository(client);

  const participations = await repository.listForUser("u1");
  const ownParticipation = await repository.findByIdForUser("p1", "u1");
  const foreignParticipation = await repository.findByIdForUser("p2", "u1");

  assert.deepEqual(participations.map((participation) => participation.id), ["p1"]);
  assert.equal(participations[0].startedAt, "2026-09-01T08:00:00.000Z");
  assert.equal(participations[0].definition.type, "daily_boolean");
  assert.equal(ownParticipation?.challengeSlug, "schritte");
  assert.equal(foreignParticipation, null);
  assert.deepEqual(queries[0].values, ["u1"]);
  assert.match(queries[0].text, /participations\.user_id = \$1/);
  assert.deepEqual(queries[1].values, ["p1", "u1"]);
  assert.match(queries[1].text, /participations\.id = \$1 AND participations\.user_id = \$2/);
  assert.ok(!queries[1].text.includes("p1"));
});

test("PostgreSQL-Teilnahmeadapter liefert nur nutzergebundene Check-ins chronologisch", async () => {
  const queries: Array<{ text: string; values?: unknown[] }> = [];
  const client: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      return {
        rows: values?.[0] === "p1" && values?.[1] === "u1"
          ? [
              { date: "2026-08-31", value: null },
              { date: "2026-09-01", value: 12345 }
            ]
          : []
      };
    }
  };
  const repository = new PostgresqlParticipationReadRepository(client);

  assert.deepEqual(await repository.listCheckInDatesForUser("p1", "u1"), [
    "2026-08-31",
    "2026-09-01"
  ]);
  assert.deepEqual(await repository.listCheckInsForUser("p2", "u1"), []);
  assert.match(queries[0].text, /participations\.user_id = \$2/);
  assert.match(queries[0].text, /ORDER BY check_ins\.date ASC/);
  assert.deepEqual(queries[0].values, ["p1", "u1"]);
  assert.ok(!queries[0].text.includes("p1"));
});
