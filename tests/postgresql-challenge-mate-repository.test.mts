import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlChallengeMateRepository } from "../infrastructure/postgresql/postgresql-challenge-mate-repository.ts";

type Query = { text: string; values?: unknown[] };
type Handler = (text: string, values?: unknown[]) => unknown[];

function createClient(handler: Handler) {
  const queries: Query[] = [];
  let transactions = 0;
  const query = async (text: string, values?: unknown[]) => {
    queries.push({ text, values });
    return { rows: handler(text, values) };
  };
  const transactionClient: PostgresQueryClient = { query };
  const client: PostgresTransactionalQueryClient = {
    query,
    async transaction<T>(callback: (transaction: PostgresQueryClient) => Promise<T>) {
      transactions += 1;
      return callback(transactionClient);
    }
  };
  return { client, queries, transactionCount: () => transactions };
}

const aliceProfile = {
  user_id: "alice",
  participation_id: "alice-steps",
  challenge_id: "steps",
  challenge_slug: "10000-schritte-am-tag",
  challenge_title: "10.000 Schritte am Tag",
  user_name: "Alice",
  goal: "Gemeinsam konsequent dranbleiben",
  available_from: "2026-09-01",
  available_until: "2026-09-30",
  mode: "remote",
  location: null,
  active: true,
  updated_at: new Date("2026-09-03T10:00:00.000Z")
} as const;
const bobProfile = {
  ...aliceProfile,
  user_id: "bob",
  participation_id: "bob-steps",
  user_name: "Bob"
} as const;

const saveInput = {
  userId: "alice",
  participationId: "alice-steps",
  goal: "Gemeinsam konsequent dranbleiben",
  availableFrom: "2026-09-01",
  availableUntil: "2026-09-30",
  mode: "remote" as const,
  location: null,
  updatedAt: "2026-09-03T10:00:00.000Z"
};

test("PostgreSQL-ChallengeMate speichert Opt-in und Privacy atomar nur für eigene aktive Teilnahmen", async () => {
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("SELECT id FROM users")) return [{ id: "alice" }];
    if (text.includes("SELECT participation_id")) return [];
    if (text.includes("status = 'matched'")) return [];
    if (text.includes("INSERT INTO challenge_mate_profiles")) return [{ user_id: "alice" }];
    if (text.includes("INSERT INTO account_privacy_preferences")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlChallengeMateRepository(client);

  assert.deepEqual(await repository.saveProfile(saveInput), { status: "saved" });
  assert.equal(transactionCount(), 1);
  const profileInsert = queries.find((query) => query.text.includes("INSERT INTO challenge_mate_profiles"));
  assert.deepEqual(profileInsert?.values, [
    "alice",
    saveInput.goal,
    saveInput.availableFrom,
    saveInput.availableUntil,
    "remote",
    null,
    saveInput.updatedAt,
    "alice-steps"
  ]);
  assert.match(profileInsert?.text ?? "", /participations\.user_id = \$1/);
  assert.match(profileInsert?.text ?? "", /participations\.status = 'active'/);
  assert.match(queries.at(-1)?.text ?? "", /challenge_mate_discoverable = TRUE/);
});

test("PostgreSQL-ChallengeMate verhindert Challengewechsel bei aktivem Match", async () => {
  const { client, queries } = createClient((text) => {
    if (text.includes("SELECT id FROM users")) return [{ id: "alice" }];
    if (text.includes("SELECT participation_id")) return [{ participation_id: "alice-reading" }];
    if (text.includes("status = 'matched'")) return [{ exists: 1 }];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlChallengeMateRepository(client);

  assert.deepEqual(await repository.saveProfile(saveInput), { status: "active_match_conflict" });
  assert.equal(queries.some((query) => query.text.includes("INSERT INTO challenge_mate_profiles")), false);
});

test("PostgreSQL-Dashboard mappt Vorschläge und Verbindungen datensparsam", async () => {
  const connection = {
    id: "match-1",
    requester_user_id: "alice",
    recipient_user_id: "bob",
    status: "matched",
    created_at: new Date("2026-09-03T11:00:00.000Z"),
    matched_at: new Date("2026-09-03T12:00:00.000Z")
  };
  const { client, queries } = createClient((text, values) => {
    if (text.includes("WHERE profiles.user_id = $1")) return values?.[0] === "alice" ? [aliceProfile] : [];
    if (text.includes("SELECT blocked_user_id AS user_id")) return [];
    if (text.includes("FROM challenge_mate_connections") && text.includes("ORDER BY")) return [connection];
    if (text.includes("profiles.user_id = ANY")) return [bobProfile];
    if (text.includes("profiles.active = TRUE")) return [aliceProfile, bobProfile];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlChallengeMateRepository(client);

  const dashboard = await repository.getDashboard("alice");
  assert.equal(dashboard.profile?.updatedAt, "2026-09-03T10:00:00.000Z");
  assert.deepEqual(dashboard.suggestions, []);
  assert.deepEqual(dashboard.matches, [{
    connectionId: "match-1",
    mateUserId: "bob",
    mateName: "Bob",
    mateGoal: "Gemeinsam konsequent dranbleiben",
    challengeSlug: "10000-schritte-am-tag",
    challengeTitle: "10.000 Schritte am Tag",
    mode: "remote",
    location: null,
    createdAt: "2026-09-03T11:00:00.000Z",
    matchedAt: "2026-09-03T12:00:00.000Z"
  }]);
  const candidateQuery = queries.find((query) => query.text.includes("profiles.active = TRUE"));
  assert.match(candidateQuery?.text ?? "", /challenge_mate_discoverable/);
});

test("PostgreSQL-ChallengeMate schützt Anfrage, Bestätigung, Block und Meldung transaktional", async () => {
  let pending = false;
  let matched = false;
  let blocked = false;
  const { client, queries, transactionCount } = createClient((text, values) => {
    if (text.includes("SELECT id FROM users")) return (values?.[0] as string[]).map((id) => ({ id }));
    if (text.includes("WHERE profiles.user_id = $1")) {
      return values?.[0] === "alice" ? [aliceProfile] : values?.[0] === "bob" ? [bobProfile] : [];
    }
    if (text.includes("SELECT 1 FROM challenge_mate_blocks")) return blocked ? [{ exists: 1 }] : [];
    if (text.includes("INSERT INTO challenge_mate_connections")) {
      if (pending) return [];
      pending = true;
      return [{ id: "match-1" }];
    }
    if (text.includes("FROM challenge_mate_connections") && text.includes("recipient_user_id = $2")) {
      return pending && !matched
        ? [{ requester_user_id: "alice", recipient_user_id: "bob" }]
        : [];
    }
    if (text.includes("UPDATE challenge_mate_connections") && text.includes("status = 'matched'")) {
      matched = true;
      return [{ id: "match-1" }];
    }
    if (text.includes("INSERT INTO challenge_mate_blocks")) {
      blocked = true;
      return [];
    }
    if (text.includes("SET status = 'blocked'")) return [];
    if (text.includes("INSERT INTO challenge_mate_reports")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlChallengeMateRepository(client);

  assert.deepEqual(await repository.requestMatch({
    id: "match-1",
    requesterUserId: "alice",
    recipientUserId: "bob",
    createdAt: "2026-09-03T11:00:00.000Z"
  }), { status: "requested", connectionId: "match-1" });
  assert.deepEqual(await repository.requestMatch({
    id: "match-2",
    requesterUserId: "alice",
    recipientUserId: "bob",
    createdAt: "2026-09-03T11:01:00.000Z"
  }), { status: "already_exists" });
  assert.deepEqual(await repository.acceptMatch({
    connectionId: "match-1",
    recipientUserId: "bob",
    acceptedAt: "2026-09-03T12:00:00.000Z"
  }), { status: "matched", connectionId: "match-1" });
  assert.deepEqual(await repository.blockUser({
    blockerUserId: "alice",
    blockedUserId: "bob",
    createdAt: "2026-09-03T13:00:00.000Z"
  }), { status: "blocked" });
  assert.deepEqual(await repository.reportUser({
    id: "report-1",
    reporterUserId: "alice",
    reportedUserId: "bob",
    reason: "spam",
    details: "Wiederholte unpassende Anfragen",
    createdAt: "2026-09-03T13:01:00.000Z"
  }), { status: "reported" });
  assert.deepEqual(await repository.reportUser({
    id: "report-self",
    reporterUserId: "alice",
    reportedUserId: "alice",
    reason: "other",
    details: null,
    createdAt: "2026-09-03T13:02:00.000Z"
  }), { status: "invalid_target" });
  assert.equal(transactionCount(), 5);
  assert.match(queries.find((query) => query.text.includes("INSERT INTO challenge_mate_connections"))?.text ?? "", /ON CONFLICT DO NOTHING/);
  assert.match(queries.find((query) => query.text.includes("INSERT INTO challenge_mate_reports"))?.text ?? "", /'open'/);
});
