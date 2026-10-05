import * as assert from "node:assert/strict";
import { test } from "node:test";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "../infrastructure/postgresql/postgres-query-client.ts";
import { PostgresqlRetentionRepository } from "../infrastructure/postgresql/postgresql-retention-repository.ts";

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

const participation = {
  id: "p1",
  challenge_slug: "lesen",
  challenge_title: "Jeden Tag lesen",
  started_at: new Date("2026-08-01T08:00:00.000Z"),
  status: "active",
  completed_at: null
};

const dashboardInput = {
  userId: "u1",
  participationId: "p1",
  today: "2026-08-09",
  now: "2026-08-09T18:00:00.000Z"
};

test("PostgreSQL-Retention synchronisiert das eigene Dashboard transaktional und idempotent", async () => {
  let nextId = 0;
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("JOIN challenges")) return [participation];
    if (text.includes("INSERT INTO retention_preferences")) return [];
    if (text.includes("SELECT date FROM check_ins")) return [{ date: "2026-08-07" }];
    if (text.includes("DELETE FROM retention_notifications")) return [];
    if (text.includes("FROM challenge_mate_connections")) return [{
      id: "mate-1",
      status: "pending",
      created_at: new Date("2026-08-08T12:00:00.000Z"),
      matched_at: null,
      mate_name: "Ben"
    }];
    if (text.includes("INSERT INTO retention_notifications")) return [];
    if (text.includes("SELECT in_app_enabled")) return [{
      in_app_enabled: true,
      email_reminder_enabled: false,
      weekly_recap_enabled: false
    }];
    if (text.includes("SELECT id, type, title")) return [{
      id: "notification-3",
      type: "mate_request",
      title: "Neue ChallengeMate-Anfrage",
      body: "Ben möchte diese Challenge mit dir angehen.",
      href: "/challenge-mate",
      occurred_at: new Date("2026-08-08T12:00:00.000Z"),
      read_at: null
    }];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlRetentionRepository(client, () => `notification-${++nextId}`);

  const dashboard = await repository.getDashboard(dashboardInput);

  assert.equal(transactionCount(), 1);
  assert.deepEqual(dashboard?.preferences, {
    inAppEnabled: true,
    emailReminderEnabled: false,
    weeklyRecapEnabled: false
  });
  assert.equal(dashboard?.notifications[0]?.occurredAt, "2026-08-08T12:00:00.000Z");
  const inserts = queries.filter((query) => query.text.includes("INSERT INTO retention_notifications"));
  assert.deepEqual(inserts.map((query) => query.values?.[4]), [
    "reactivation",
    "weekly_recap",
    "mate_request"
  ]);
  assert.ok(inserts.every((query) => query.text.includes("ON CONFLICT (user_id, source_key) DO NOTHING")));
  assert.deepEqual(queries.find((query) => query.text.includes("JOIN challenges"))?.values, ["p1", "u1"]);
});

test("PostgreSQL-Retention gibt für fremde oder unbekannte Teilnahme kein Dashboard frei", async () => {
  const { client, queries } = createClient((text) => {
    if (text.includes("JOIN challenges")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlRetentionRepository(client);

  assert.equal(await repository.getDashboard(dashboardInput), null);
  assert.equal(queries.some((query) => query.text.includes("retention_preferences")), false);
});

test("PostgreSQL-Retention bindet Einstellungen, Lesestatus und Abmeldung an den Nutzer", async () => {
  const { client, queries } = createClient((text) => {
    if (text.includes("INSERT INTO retention_preferences")) return [{ participation_id: "p1" }];
    if (text.includes("SET read_at")) return [{ id: "n1" }];
    if (text.includes("SET email_reminder_enabled")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlRetentionRepository(client);

  assert.deepEqual(await repository.updatePreferences({
    userId: "u1",
    participationId: "p1",
    inAppEnabled: false,
    emailReminderEnabled: true,
    weeklyRecapEnabled: true,
    updatedAt: dashboardInput.now
  }), { status: "updated" });
  assert.deepEqual(await repository.markRead({
    notificationId: "n1",
    userId: "u1",
    readAt: dashboardInput.now
  }), { status: "updated" });
  assert.deepEqual(await repository.disableEmail({
    userId: "u2",
    participationId: "p1",
    updatedAt: dashboardInput.now
  }), { status: "not_found" });

  const preferenceQuery = queries.find((query) => query.text.includes("INSERT INTO retention_preferences"));
  assert.deepEqual(preferenceQuery?.values, [false, true, true, dashboardInput.now, "p1", "u1"]);
  assert.match(preferenceQuery?.text ?? "", /participations\.user_id = \$6/);
  assert.deepEqual(queries.find((query) => query.text.includes("SET read_at"))?.values, [dashboardInput.now, "n1", "u1"]);
  assert.deepEqual(queries.find((query) => query.text.includes("SET email_reminder_enabled"))?.values, [dashboardInput.now, "u2", "p1"]);
});

test("PostgreSQL-Retention erzeugt fällige Jobs ohne Seitenaufruf und markiert Zustellung", async () => {
  const { client, queries, transactionCount } = createClient((text) => {
    if (text.includes("SELECT user_id, participation_id")) return [{ user_id: "u1", participation_id: "p1" }];
    if (text.includes("JOIN challenges")) return [participation];
    if (text.includes("SELECT date FROM check_ins")) return [{ date: "2026-08-07" }];
    if (text.includes("DELETE FROM retention_notifications")) return [];
    if (text.includes("FROM challenge_mate_connections")) return [];
    if (text.includes("INSERT INTO retention_notifications")) return [];
    if (text.includes("JOIN retention_preferences")) return [{
      id: "n-week",
      type: "weekly_recap",
      title: "Dein Wochenrückblick",
      body: "Du warst an 1 von 7 Tagen dabei.",
      href: "/meine-challenges/p1",
      occurred_at: new Date("2026-08-09T17:00:00.000Z"),
      read_at: null,
      participation_id: "p1",
      user_id: "u1",
      email: "ada@example.test"
    }];
    if (text.includes("SET email_delivered_at")) return [];
    throw new Error(`Unerwartete Abfrage: ${text}`);
  });
  const repository = new PostgresqlRetentionRepository(client, () => "generated-notification");

  const jobs = await repository.listDueEmailJobs({ ...dashboardInput, limit: 999 });
  await repository.markEmailDelivered({ notificationId: jobs[0]!.id, deliveredAt: dashboardInput.now });

  assert.equal(transactionCount(), 1);
  assert.deepEqual(jobs, [{
    id: "n-week",
    type: "weekly_recap",
    title: "Dein Wochenrückblick",
    body: "Du warst an 1 von 7 Tagen dabei.",
    href: "/meine-challenges/p1",
    occurredAt: "2026-08-09T17:00:00.000Z",
    readAt: null,
    participationId: "p1",
    userId: "u1",
    email: "ada@example.test"
  }]);
  assert.deepEqual(queries.find((query) => query.text.includes("JOIN retention_preferences"))?.values, [100]);
  assert.deepEqual(queries.find((query) => query.text.includes("SET email_delivered_at"))?.values, [dashboardInput.now, "n-week"]);
});
