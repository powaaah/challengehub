import * as assert from "node:assert/strict";
import { test } from "node:test";
import { SYSTEM_ACCOUNT_NAME_KEY } from "../domain/accounts/username.ts";
import { PostgresqlCuratedChallengeBootstrapRepository } from "../infrastructure/postgresql/postgresql-curated-challenge-bootstrap-repository.ts";
import type { PostgresQueryClient, PostgresTransactionalQueryClient } from "../infrastructure/postgresql/postgres-query-client.ts";

type Query = { text: string; values?: unknown[] };
type StoredChallenge = { id: string; slug: string };

const challenge = {
  id: "curated:10000-schritte-am-tag", slug: "10000-schritte-am-tag",
  title: "10 000 Schritte am Tag Challenge", level: "Beginner",
  goal: "Gehe jeden Tag 10 000 Schritte.", description: "Eine einfache Dauer-Challenge.",
  rules: ["Täglich 10 000 Schritte gehen."], tips: ["Plane feste Gehzeiten ein."],
  definition: { type: "daily_boolean" as const, unit: "completion" as const,
    targetValue: 1 as const, frequency: "daily" as const, direction: "at_least" as const,
    completionCriterion: "daily_check_in" as const }
};

function createClient(initialChallenge?: StoredChallenge) {
  const queries: Query[] = [];
  const challenges = new Map<string, StoredChallenge>();
  if (initialChallenge) challenges.set(initialChallenge.slug, initialChallenge);
  let systemUserCreated = false;
  let transactionCount = 0;
  const transactionClient: PostgresQueryClient = {
    async query(text, values) {
      queries.push({ text, values });
      if (text.includes("SELECT id FROM challenges WHERE slug = $1")) {
        const stored = challenges.get(String(values?.[0]));
        return { rows: stored ? [{ id: stored.id }] : [] };
      }
      if (text.includes("INSERT INTO users")) { systemUserCreated = true; return { rows: [] }; }
      if (text.includes("INSERT INTO challenges")) {
        const stored = challenges.get(String(values?.[2]));
        if (stored) return { rows: [] };
        const inserted = { id: String(values?.[0]), slug: String(values?.[2]) };
        challenges.set(inserted.slug, inserted);
        return { rows: [{ id: inserted.id }] };
      }
      throw new Error();
    }
  };
  const client: PostgresTransactionalQueryClient = {
    query: transactionClient.query,
    async transaction(callback) { transactionCount += 1; return callback(transactionClient); }
  };
  return { client, challenges, queries, getSystemUserCreated: () => systemUserCreated,
    getTransactionCount: () => transactionCount };
}

test("PostgreSQL-Bootstrap materialisiert Systemnutzer und kuratierte Challenge atomar idempotent", async () => {
  const state = createClient();
  const repository = new PostgresqlCuratedChallengeBootstrapRepository(state.client, () => "2026-09-06T08:00:00.000Z");
  assert.equal(await repository.ensureChallenge(challenge), challenge.id);
  assert.equal(await repository.ensureChallenge(challenge), challenge.id);
  assert.equal(state.getTransactionCount(), 2);
  assert.equal(state.getSystemUserCreated(), true);
  assert.equal(state.challenges.size, 1);
  const userInsert = state.queries.find((query) => query.text.includes("INSERT INTO users"));
  assert.deepEqual(userInsert?.values, [SYSTEM_ACCOUNT_NAME_KEY, "2026-09-06T08:00:00.000Z"]);
  assert.match(userInsert?.text ?? "", /ON CONFLICT DO NOTHING/);
  const challengeInsert = state.queries.find((query) => query.text.includes("INSERT INTO challenges"));
  assert.deepEqual(challengeInsert?.values, [challenge.id, "system", challenge.slug, challenge.title,
    challenge.level, challenge.goal, challenge.description, JSON.stringify(challenge.rules), JSON.stringify(challenge.tips),
    "2026-09-06T08:00:00.000Z", challenge.definition.type, challenge.definition.unit,
    challenge.definition.targetValue, challenge.definition.frequency, challenge.definition.direction,
    challenge.definition.completionCriterion]);
  assert.match(challengeInsert?.text ?? "", /'internal', 'published'/);
  assert.match(challengeInsert?.text ?? "", /ON CONFLICT DO NOTHING/);
});

test("PostgreSQL-Bootstrap respektiert eine bereits vorhandene Challenge mit gleichem Slug", async () => {
  const state = createClient({ id: "existing", slug: challenge.slug });
  const repository = new PostgresqlCuratedChallengeBootstrapRepository(state.client);
  assert.equal(await repository.ensureChallenge(challenge), "existing");
  assert.equal(state.getSystemUserCreated(), false);
  assert.equal(state.queries.some((query) => query.text.includes("INSERT INTO challenges")), false);
  assert.deepEqual(state.queries[0].values, [challenge.slug]);
  assert.ok(!state.queries[0].text.includes(challenge.slug));
});
