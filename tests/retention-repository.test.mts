import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { ensureRetentionSchema } from "../infrastructure/sqlite/sqlite-retention-migration.ts";
import { SqliteRetentionRepository } from "../infrastructure/sqlite/sqlite-retention-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL);
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT NOT NULL, title TEXT NOT NULL);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL, status TEXT NOT NULL, completed_at TEXT
    );
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY, participation_id TEXT NOT NULL, date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE challenge_mate_profiles (
      user_id TEXT PRIMARY KEY, participation_id TEXT NOT NULL, goal TEXT NOT NULL,
      active INTEGER NOT NULL
    );
    CREATE TABLE challenge_mate_connections (
      id TEXT PRIMARY KEY, requester_user_id TEXT NOT NULL, recipient_user_id TEXT NOT NULL,
      status TEXT NOT NULL, created_at TEXT NOT NULL, matched_at TEXT
    );
    INSERT INTO users VALUES
      ('u1', 'ada@example.test', 'Ada'),
      ('u2', 'ben@example.test', 'Ben');
    INSERT INTO challenges VALUES
      ('c1', 'lesen', 'Jeden Tag lesen'),
      ('c2', 'laufen', 'Jeden Tag laufen');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'c1', '2026-08-01T08:00:00.000Z', 'active', NULL),
      ('p2', 'u2', 'c1', '2026-08-01T08:00:00.000Z', 'active', NULL),
      ('p3', 'u1', 'c2', '2026-08-01T08:00:00.000Z', 'active', NULL);
    INSERT INTO check_ins VALUES
      ('i1', 'p1', '2026-08-07', '2026-08-07T18:00:00.000Z');
    INSERT INTO challenge_mate_profiles VALUES
      ('u1', 'p1', 'Gemeinsam lesen und dranbleiben.', 1),
      ('u2', 'p2', 'Gemeinsam lesen und dranbleiben.', 1);
    INSERT INTO challenge_mate_connections VALUES
      ('m1', 'u2', 'u1', 'pending', '2026-08-08T12:00:00.000Z', NULL);
  `);
  ensureRetentionSchema(db);
  let nextId = 0;
  return { db, repository: new SqliteRetentionRepository(db, () => `notification-${++nextId}`) };
}

test("Dashboard legt Standardpräferenzen und echte Meldungen idempotent an", () => {
  const { db, repository } = createRepository();
  const input = {
    userId: "u1",
    participationId: "p1",
    today: "2026-08-09",
    now: "2026-08-09T18:00:00.000Z"
  };

  const first = repository.getDashboard(input);
  const second = repository.getDashboard(input);

  assert.deepEqual(first?.preferences, {
    inAppEnabled: true,
    emailReminderEnabled: false,
    weeklyRecapEnabled: false
  });
  assert.deepEqual(first?.notifications.map((item) => item.type), [
    "weekly_recap",
    "reactivation",
    "mate_request"
  ]);
  assert.equal(second?.notifications.length, 3);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM retention_notifications").get()?.count, 3);
  db.close();
});

test("Präferenzen gehören zur Teilnahme und der Queue-Lauf erzeugt Jobs ohne vorherigen Seitenaufruf", () => {
  const { db, repository } = createRepository();
  assert.equal(repository.updatePreferences({
    userId: "u2",
    participationId: "p1",
    inAppEnabled: true,
    emailReminderEnabled: true,
    weeklyRecapEnabled: true,
    updatedAt: "2026-08-09T18:00:00.000Z"
  }).status, "not_found");
  assert.equal(repository.updatePreferences({
    userId: "u1",
    participationId: "p1",
    inAppEnabled: true,
    emailReminderEnabled: true,
    weeklyRecapEnabled: true,
    updatedAt: "2026-08-09T18:00:00.000Z"
  }).status, "updated");

  const jobs = repository.listDueEmailJobs({
    today: "2026-08-09", now: "2026-08-09T18:00:00.000Z", limit: 10
  });

  assert.deepEqual(jobs.map((job) => job.type), ["weekly_recap", "reactivation"]);
  assert.equal(jobs[0]?.email, "ada@example.test");
  repository.markEmailDelivered({ notificationId: jobs[0]!.id, deliveredAt: "2026-08-09T18:01:00.000Z" });
  assert.equal(repository.listDueEmailJobs({
    today: "2026-08-09", now: "2026-08-09T18:02:00.000Z", limit: 10
  }).length, 1);
  db.close();
});

test("Feed kann teilnahmegebunden gelesen und E-Mail vollständig abgemeldet werden", () => {
  const { db, repository } = createRepository();
  repository.updatePreferences({
    userId: "u1", participationId: "p1", inAppEnabled: true,
    emailReminderEnabled: true, weeklyRecapEnabled: true,
    updatedAt: "2026-08-09T18:00:00.000Z"
  });
  const dashboard = repository.getDashboard({
    userId: "u1", participationId: "p1", today: "2026-08-09", now: "2026-08-09T18:00:00.000Z"
  });
  const notificationId = dashboard!.notifications[0]!.id;

  assert.equal(repository.markRead({
    notificationId, userId: "u2", readAt: "2026-08-09T18:02:00.000Z"
  }).status, "not_found");
  assert.equal(repository.markRead({
    notificationId, userId: "u1", readAt: "2026-08-09T18:02:00.000Z"
  }).status, "updated");
  assert.equal(repository.disableEmail({
    userId: "u1", participationId: "p1", updatedAt: "2026-08-09T18:03:00.000Z"
  }).status, "updated");

  const preferences = repository.getDashboard({
    userId: "u1", participationId: "p1", today: "2026-08-09", now: "2026-08-09T18:04:00.000Z"
  })!.preferences;
  assert.equal(preferences.emailReminderEnabled, false);
  assert.equal(preferences.weeklyRecapEnabled, false);
  db.close();
});

test("alte Mate-Anfragen erscheinen nach Profilwechsel nicht in einer anderen Challenge", () => {
  const { db, repository } = createRepository();
  db.prepare("UPDATE challenge_mate_profiles SET participation_id = 'p3' WHERE user_id = 'u1'").run();

  const dashboard = repository.getDashboard({
    userId: "u1", participationId: "p3", today: "2026-08-09", now: "2026-08-09T18:00:00.000Z"
  });

  assert.equal(dashboard?.notifications.some((item) => item.type === "mate_request"), false);
  db.close();
});

test("erledigter Tages-Check-in entfernt die zuvor offene Erinnerung", () => {
  const { db, repository } = createRepository();
  const input = {
    userId: "u1", participationId: "p1", today: "2026-08-09", now: "2026-08-09T08:00:00.000Z"
  };
  assert.equal(repository.getDashboard(input)?.notifications.some((item) => item.type === "reactivation"), true);

  db.prepare(`
    INSERT INTO check_ins VALUES ('i2', 'p1', '2026-08-09', '2026-08-09T12:00:00.000Z')
  `).run();
  const dashboard = repository.getDashboard({ ...input, now: "2026-08-09T12:01:00.000Z" });

  assert.equal(dashboard?.notifications.some((item) => (
    item.type === "daily_reminder" || item.type === "reactivation"
  )), false);
  db.close();
});
