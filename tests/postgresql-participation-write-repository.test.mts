import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  PostgresqlParticipationWriteRepository
} from "../infrastructure/postgresql/postgresql-participation-write-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";

type Query = { text: string; values?: unknown[] };
type Participation = {
  id: string;
  userId: string;
  challengeId: string;
  status: "active" | "completed" | "cancelled";
};

function createClient() {
  const queries: Query[] = [];
  const participations = new Map<string, Participation>();
  let transactionCount = 0;

  const transactionClient: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });

      if (text.includes("INSERT INTO participations")) {
        const [id, userId, challengeId] = values ?? [];
        const existing = [...participations.values()].find(
          (participation) => participation.userId === userId && participation.challengeId === challengeId
        );
        if (existing || userId !== "u1" || challengeId !== "published") return { rows: [] };
        participations.set(String(id), {
          id: String(id), userId: String(userId), challengeId: String(challengeId), status: "active"
        });
        return { rows: [{ id }] };
      }

      if (text.includes("SELECT id") && text.includes("challenge_id = $2")) {
        const existing = [...participations.values()].find(
          (participation) => participation.userId === values?.[0] && participation.challengeId === values?.[1]
        );
        return { rows: existing ? [{ id: existing.id }] : [] };
      }

      if (text.includes("UPDATE participations")) {
        const participation = participations.get(String(values?.[1]));
        if (!participation || participation.userId !== values?.[2] || participation.status !== "active") {
          return { rows: [] };
        }
        participation.status = "cancelled";
        return { rows: [{ id: participation.id }] };
      }

      if (text.includes("SELECT 1 AS found")) {
        const participation = participations.get(String(values?.[0]));
        return {
          rows: participation?.userId === values?.[1] ? [{ found: 1 }] : []
        };
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

  return { client, participations, queries, getTransactionCount: () => transactionCount };
}

test("PostgreSQL-Teilnahmestart prüft Freigabe und Nutzer, bleibt atomar idempotent", async () => {
  const { client, participations, queries, getTransactionCount } = createClient();
  const repository = new PostgresqlParticipationWriteRepository(
    client,
    () => "participation-1",
    () => "2026-09-01T12:00:00.000Z"
  );
  const input = { userId: "u1", challengeId: "published" };

  assert.deepEqual(await repository.startForUser(input), {
    status: "created", participationId: "participation-1"
  });
  assert.deepEqual(await repository.startForUser(input), {
    status: "already_exists", participationId: "participation-1"
  });
  assert.deepEqual(await repository.startForUser({ userId: "u1", challengeId: "draft" }), {
    status: "challenge_not_available"
  });
  assert.deepEqual(await repository.startForUser({ userId: "missing", challengeId: "published" }), {
    status: "challenge_not_available"
  });
  assert.equal(getTransactionCount(), 4);
  assert.equal(participations.size, 1);

  const insert = queries.find((query) => query.text.includes("INSERT INTO participations"));
  assert.deepEqual(insert?.values, [
    "participation-1", "u1", "published", "2026-09-01T12:00:00.000Z"
  ]);
  assert.match(insert?.text ?? "", /challenges\.status = 'published'/);
  assert.match(insert?.text ?? "", /users\.id = \$2/);
  assert.match(insert?.text ?? "", /ON CONFLICT \(user_id, challenge_id\) DO NOTHING/);
});

test("PostgreSQL-Teilnahmeaustritt schützt Eigentum und ist atomar idempotent", async () => {
  const { client, participations, queries, getTransactionCount } = createClient();
  participations.set("p1", {
    id: "p1", userId: "u1", challengeId: "published", status: "active"
  });
  const repository = new PostgresqlParticipationWriteRepository(
    client,
    () => "unused",
    () => "2026-09-01T13:00:00.000Z"
  );

  assert.deepEqual(await repository.leaveForUser({ userId: "u2", participationId: "p1" }), {
    status: "not_found"
  });
  assert.equal(participations.get("p1")?.status, "active");
  assert.deepEqual(await repository.leaveForUser({ userId: "u1", participationId: "p1" }), {
    status: "left"
  });
  assert.deepEqual(await repository.leaveForUser({ userId: "u1", participationId: "p1" }), {
    status: "already_inactive"
  });
  assert.equal(getTransactionCount(), 3);

  const update = queries.find((query) => query.text.includes("UPDATE participations"));
  assert.deepEqual(update?.values, ["2026-09-01T13:00:00.000Z", "p1", "u2"]);
  assert.match(update?.text ?? "", /status = 'active'/);
  assert.match(update?.text ?? "", /RETURNING id/);
  const ownershipCheck = queries.find((query) => query.text.includes("SELECT 1 AS found"));
  assert.deepEqual(ownershipCheck?.values, ["p1", "u2"]);
});
