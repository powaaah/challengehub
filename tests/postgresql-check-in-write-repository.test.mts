import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  PostgresqlCheckInWriteRepository
} from "../infrastructure/postgresql/postgresql-check-in-write-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";

type Query = { text: string; values?: unknown[] };

function createClient(definition: {
  challenge_type: string;
  target_value: number;
  measurement_direction: string;
  completion_criterion: string;
}) {
  const queries: Query[] = [];
  let transactionCount = 0;
  let inserted = false;
  let completed = false;

  const transactionClient: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      if (text.includes("FOR UPDATE")) {
        return {
          rows: values?.[0] === "p1" && values?.[1] === "u1" && !completed
            ? [definition]
            : []
        };
      }
      if (text.includes("INSERT INTO check_ins")) {
        if (inserted) return { rows: [] };
        inserted = true;
        return { rows: [{ id: values?.[0] }] };
      }
      if (text.includes("AS aggregate_value")) {
        return { rows: [{ aggregate_value: 125 }] };
      }
      if (text.includes("UPDATE participations")) {
        completed = true;
        return { rows: [{ id: "p1" }] };
      }
      throw new Error(`Unerwartete Abfrage: ${text}`);
    }
  };
  const client: PostgresTransactionalQueryClient = {
    query: transactionClient.query,
    async transaction(callback) {
      transactionCount += 1;
      return callback(transactionClient);
    }
  };

  return { client, queries, getTransactionCount: () => transactionCount };
}

test("PostgreSQL-Check-in schreibt nutzergebunden und am selben Tag idempotent in einer Transaktion", async () => {
  const { client, queries, getTransactionCount } = createClient({
    challenge_type: "daily_boolean",
    target_value: 1,
    measurement_direction: "at_least",
    completion_criterion: "daily_check_in"
  });
  const repository = new PostgresqlCheckInWriteRepository(
    client,
    () => "check-in-1",
    () => "2026-09-01T12:00:00.000Z"
  );
  const input = { participationId: "p1", userId: "u1", date: "2026-09-01" };

  assert.equal(await repository.createForUser(input), "created");
  assert.equal(await repository.createForUser(input), "already_exists");
  assert.equal(await repository.createForUser({ ...input, participationId: "foreign" }), "participation_not_found");
  assert.equal(getTransactionCount(), 3);

  const lock = queries.find((query) => query.text.includes("FOR UPDATE"));
  const insert = queries.find((query) => query.text.includes("INSERT INTO check_ins"));
  assert.deepEqual(lock?.values, ["p1", "u1"]);
  assert.match(lock?.text ?? "", /participations\.status = 'active'/);
  assert.ok(!(lock?.text ?? "").includes("u1"));
  assert.deepEqual(insert?.values, [
    "check-in-1", "p1", "2026-09-01", null, "2026-09-01T12:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /ON CONFLICT \(participation_id, date\) DO NOTHING/);
});

test("PostgreSQL-Check-in validiert Messwerte und schließt erreichte Ziele atomar ab", async () => {
  const { client, queries } = createClient({
    challenge_type: "cumulative_metric",
    target_value: 100,
    measurement_direction: "at_least",
    completion_criterion: "cumulative_target"
  });
  const repository = new PostgresqlCheckInWriteRepository(
    client,
    () => "check-in-2",
    () => "2026-09-01T12:00:00.000Z"
  );

  assert.equal(await repository.createForUser({
    participationId: "p1", userId: "u1", date: "2026-09-01"
  }), "invalid_value");
  assert.equal(await repository.createForUser({
    participationId: "p1", userId: "u1", date: "2026-09-01", value: 125
  }), "created");

  const aggregate = queries.find((query) => query.text.includes("AS aggregate_value"));
  const completion = queries.find((query) => query.text.includes("UPDATE participations"));
  assert.match(aggregate?.text ?? "", /SUM\(value\)/);
  assert.deepEqual(aggregate?.values, ["p1"]);
  assert.deepEqual(completion?.values, ["2026-09-01T12:00:00.000Z", "p1"]);
  assert.match(completion?.text ?? "", /status = 'completed'/);
});
