import assert from "node:assert/strict";
import test from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlAccountDataRepository } from "../infrastructure/postgresql/postgresql-account-data-repository.ts";

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

const now = "2026-09-05T08:00:00.000Z";

test("PostgreSQL-Kontodaten verwalten private Defaults und ChallengeMate-Freigabe gemeinsam", async () => {
  let updated = false;
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("INSERT INTO account_privacy_preferences")) {
      return text.includes("RETURNING user_id") ? [{ user_id: "u1" }] : [];
    }
    if (text.includes("SELECT ranking_visible")) return [{
      ranking_visible: false,
      activity_visible: true,
      challenge_mate_discoverable: false
    }];
    if (text.includes("UPDATE challenge_mate_profiles")) {
      updated = true;
      return [];
    }
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlAccountDataRepository(client);

  assert.deepEqual(await repository.getPrivacyPreferences("u1", now), {
    rankingVisible: false,
    activityVisible: true,
    challengeMateDiscoverable: false
  });
  assert.deepEqual(await repository.updatePrivacyPreferences({
    userId: "u1",
    rankingVisible: true,
    activityVisible: false,
    challengeMateDiscoverable: true,
    updatedAt: now
  }), { status: "updated" });

  assert.equal(transactionCount(), 2);
  assert.equal(updated, true);
  const write = queries.find((query) => query.text.includes("RETURNING user_id"));
  assert.deepEqual(write?.values, [true, false, true, now, "u1"]);
  assert.match(write?.text ?? "", /ON CONFLICT \(user_id\) DO UPDATE/);
  assert.deepEqual(queries.find((query) => query.text.includes("UPDATE challenge_mate_profiles"))?.values,
    [true, now, "u1"]);
});

test("PostgreSQL-Kontoexport liefert alle eigenen Bereiche ohne Passwort- oder Tokenwerte", async () => {
  const created = new Date("2026-07-01T08:00:00.000Z");
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("FROM users WHERE id")) return [{
      id: "u1", email: "ada@example.test", name: "Ada",
      createdAt: created, emailVerifiedAt: null
    }];
    if (text.includes("INSERT INTO account_privacy_preferences")) return [];
    if (text.includes("SELECT ranking_visible")) return [{
      ranking_visible: true, activity_visible: false, challenge_mate_discoverable: true
    }];
    if (text.includes("FROM participations") && text.includes("JOIN challenges")) return [{
      id: "p1", challengeSlug: "lesen", challengeTitle: "Jeden Tag lesen",
      startedAt: created, status: "active", completedAt: null
    }];
    if (text.includes("FROM check_ins")) return [{
      id: "i1", date: "2026-08-08", value: null, note: "Eigene Notiz", createdAt: created
    }];
    if (text.includes("FROM sessions")) return [{ id: "s1", expiresAt: created, createdAt: created }];
    if (text.includes("FROM challenges WHERE creator_id")) return [{
      id: "c1", slug: "lesen", title: "Lesen", rules: ["Lies"], tips: ["Klein starten"],
      createdAt: created, updatedAt: created
    }];
    if (text.includes("FROM challenge_mate_profiles")) return [{
      participationId: "p1", goal: "Gemeinsam lesen", updatedAt: created
    }];
    if (text.includes("FROM retention_preferences")) return [{
      participationId: "p1", inAppEnabled: true, updatedAt: created
    }];
    return [];
  });
  const repository = new PostgresqlAccountDataRepository(client);

  const exported = await repository.exportAccountData("u1", now);

  assert.equal(transactionCount(), 1);
  assert.equal(exported?.account.createdAt, created.toISOString());
  assert.equal(exported?.sessions[0]?.expiresAt, created.toISOString());
  assert.equal(exported?.participations[0]?.checkIns[0]?.note, "Eigene Notiz");
  assert.deepEqual(exported?.createdChallenges[0]?.rules, ["Lies"]);
  assert.equal(exported?.challengeMate.profile?.updatedAt, created.toISOString());
  assert.equal(exported?.retention.preferences[0]?.updatedAt, created.toISOString());
  assert.doesNotMatch(JSON.stringify(exported), /passwordHash|tokenHash|nameKey/i);
  assert.doesNotMatch(queries.map((query) => query.text).join("\n"), /SELECT[^;]*(password_hash|token_hash|name_key)/i);
  assert.ok(queries.filter((query) => !query.text.includes("FROM check_ins"))
    .every((query) => query.values?.includes("u1") ?? false));
});

test("PostgreSQL-Kontolöschung überträgt Veröffentlichungen und löscht atomar nur das eigene Konto", async () => {
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("SELECT id FROM users")) return [{ id: "u1" }];
    if (text.includes("COUNT(*)::integer")) return [{ count: "2" }];
    return [];
  });
  const repository = new PostgresqlAccountDataRepository(client);

  assert.deepEqual(await repository.deleteAccountData({
    userId: "u1", auditId: "audit-1", deletedAt: now
  }), { status: "deleted" });

  assert.equal(transactionCount(), 1);
  assert.match(queries[0]?.text ?? "", /FOR UPDATE/);
  assert.deepEqual(queries.find((query) => query.text.includes("status <> 'published'"))?.values, ["u1"]);
  assert.deepEqual(queries.find((query) => query.text.includes("creator_id = 'system'"))?.values, [now, "u1"]);
  assert.deepEqual(queries.find((query) => query.text.includes("account_deletion_audits"))?.values,
    ["audit-1", now, 2]);
  assert.deepEqual(queries.at(-1)?.values, ["u1"]);
});

test("PostgreSQL-Kontodaten schützen Systemkonto und unbekannte Nutzer", async () => {
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("SELECT id FROM users")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlAccountDataRepository(client);

  assert.deepEqual(await repository.deleteAccountData({
    userId: "system", auditId: "audit-system", deletedAt: now
  }), { status: "not_found" });
  assert.deepEqual(await repository.deleteAccountData({
    userId: "missing", auditId: "audit-missing", deletedAt: now
  }), { status: "not_found" });
  assert.equal(transactionCount(), 1);
  assert.equal(queries.length, 1);
});
