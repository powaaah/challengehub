import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteChallengeMateRepository } from "../infrastructure/sqlite/sqlite-challenge-mate-repository.ts";
import { ensureChallengeMateSchema } from "../infrastructure/sqlite/sqlite-challenge-mate-migration.ts";
import { ensureAccountPrivacySchema } from "../infrastructure/sqlite/sqlite-account-privacy-migration.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE challenges (id TEXT PRIMARY KEY, slug TEXT NOT NULL, title TEXT NOT NULL);
    CREATE TABLE participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      challenge_id TEXT NOT NULL REFERENCES challenges(id),
      status TEXT NOT NULL
    );
    INSERT INTO users VALUES ('alice', 'Alice'), ('bob', 'Bob'), ('carla', 'Carla');
    INSERT INTO challenges VALUES
      ('steps', '10000-schritte-am-tag', '10.000 Schritte am Tag'),
      ('reading', 'jeden-tag-lesen', 'Jeden Tag lesen');
    INSERT INTO participations VALUES
      ('alice-steps', 'alice', 'steps', 'active'),
      ('bob-steps', 'bob', 'steps', 'active'),
      ('bob-reading', 'bob', 'reading', 'active'),
      ('carla-reading', 'carla', 'reading', 'active');
  `);
  ensureChallengeMateSchema(db);
  ensureAccountPrivacySchema(db);
  return { db, repository: new SqliteChallengeMateRepository(db) };
}

function saveProfile(
  repository: SqliteChallengeMateRepository,
  userId: string,
  participationId: string,
  overrides: Partial<{
    mode: "remote" | "local";
    location: string | null;
    availableFrom: string;
    availableUntil: string;
  }> = {}
) {
  return repository.saveProfile({
    userId,
    participationId,
    goal: "Gemeinsam konsequent dranbleiben",
    availableFrom: overrides.availableFrom ?? "2026-08-10",
    availableUntil: overrides.availableUntil ?? "2026-09-10",
    mode: overrides.mode ?? "remote",
    location: overrides.location ?? null,
    updatedAt: "2026-08-09T12:00:00.000Z"
  });
}

test("Opt-in benötigt eine eigene aktive Teilnahme und liefert nur kompatible Vorschläge", () => {
  const { db, repository } = createRepository();
  assert.deepEqual(saveProfile(repository, "alice", "bob-steps"), { status: "participation_not_available" });
  assert.deepEqual(saveProfile(repository, "alice", "alice-steps"), { status: "saved" });
  assert.deepEqual(saveProfile(repository, "bob", "bob-steps"), { status: "saved" });
  assert.deepEqual(saveProfile(repository, "carla", "carla-reading"), { status: "saved" });

  assert.deepEqual(repository.getDashboard("alice").suggestions.map((item) => item.userId), ["bob"]);
  assert.equal(repository.getDashboard("alice").profile?.challengeSlug, "10000-schritte-am-tag");
  assert.equal(repository.getDashboard("alice").profile?.active, true);
  db.close();
});

test("Anfrage wird erst nach Bestätigung der Gegenseite zu einem gemeinsamen Match", () => {
  const { db, repository } = createRepository();
  saveProfile(repository, "alice", "alice-steps");
  saveProfile(repository, "bob", "bob-steps");

  assert.deepEqual(repository.requestMatch({
    id: "match-1",
    requesterUserId: "alice",
    recipientUserId: "bob",
    createdAt: "2026-08-09T12:00:00.000Z"
  }), { status: "requested", connectionId: "match-1" });
  assert.deepEqual(repository.getDashboard("bob").incoming.map((item) => item.connectionId), ["match-1"]);
  assert.equal(repository.getDashboard("alice").matches.length, 0);

  assert.deepEqual(repository.acceptMatch({
    connectionId: "match-1",
    recipientUserId: "bob",
    acceptedAt: "2026-08-09T13:00:00.000Z"
  }), { status: "matched", connectionId: "match-1" });
  assert.equal(repository.getDashboard("alice").matches[0]?.mateName, "Bob");
  assert.equal(repository.getDashboard("bob").matches[0]?.mateName, "Alice");
  assert.equal(repository.getDashboard("alice").matches[0]?.challengeSlug, "10000-schritte-am-tag");
  assert.deepEqual(saveProfile(repository, "bob", "bob-reading"), { status: "active_match_conflict" });
  assert.equal(repository.getDashboard("alice").matches[0]?.challengeSlug, "10000-schritte-am-tag");
  db.close();
});

test("eine Anfrage kann nach pausiertem Opt-in nicht mehr bestätigt werden", () => {
  const { db, repository } = createRepository();
  saveProfile(repository, "alice", "alice-steps");
  saveProfile(repository, "bob", "bob-steps");
  repository.requestMatch({
    id: "match-1",
    requesterUserId: "alice",
    recipientUserId: "bob",
    createdAt: "2026-08-09T12:00:00.000Z"
  });
  repository.deactivateProfile("bob", "2026-08-09T12:30:00.000Z");

  assert.deepEqual(repository.acceptMatch({
    connectionId: "match-1",
    recipientUserId: "bob",
    acceptedAt: "2026-08-09T13:00:00.000Z"
  }), { status: "not_available" });
  db.close();
});

test("Blockieren entfernt Vorschläge und Verbindungen in beide Richtungen", () => {
  const { db, repository } = createRepository();
  saveProfile(repository, "alice", "alice-steps");
  saveProfile(repository, "bob", "bob-steps");
  repository.requestMatch({
    id: "match-1",
    requesterUserId: "alice",
    recipientUserId: "bob",
    createdAt: "2026-08-09T12:00:00.000Z"
  });
  repository.acceptMatch({
    connectionId: "match-1",
    recipientUserId: "bob",
    acceptedAt: "2026-08-09T13:00:00.000Z"
  });

  assert.deepEqual(repository.blockUser({
    blockerUserId: "alice",
    blockedUserId: "bob",
    createdAt: "2026-08-09T14:00:00.000Z"
  }), { status: "blocked" });
  assert.equal(repository.getDashboard("alice").matches.length, 0);
  assert.equal(repository.getDashboard("bob").matches.length, 0);
  assert.equal(repository.getDashboard("bob").suggestions.length, 0);
  db.close();
});

test("Melden speichert einen moderierbaren Grund, aber niemals Selbstmeldungen", () => {
  const { db, repository } = createRepository();
  saveProfile(repository, "alice", "alice-steps");
  saveProfile(repository, "bob", "bob-steps");

  assert.deepEqual(repository.reportUser({
    id: "report-1",
    reporterUserId: "alice",
    reportedUserId: "bob",
    reason: "spam",
    details: "Wiederholte unpassende Anfragen",
    createdAt: "2026-08-09T14:00:00.000Z"
  }), { status: "reported" });
  assert.deepEqual(repository.reportUser({
    id: "report-2",
    reporterUserId: "alice",
    reportedUserId: "alice",
    reason: "other",
    details: null,
    createdAt: "2026-08-09T14:00:00.000Z"
  }), { status: "invalid_target" });
  assert.deepEqual({ ...db.prepare(`
    SELECT reporter_user_id AS reporterUserId, reported_user_id AS reportedUserId,
      reason, details, status
    FROM challenge_mate_reports WHERE id = 'report-1'
  `).get() }, {
    reporterUserId: "alice",
    reportedUserId: "bob",
    reason: "spam",
    details: "Wiederholte unpassende Anfragen",
    status: "open"
  });
  db.close();
});

test("ChallengeMate-Opt-in setzt Discoverability und zentrale Privacy-Pause entfernt Vorschläge", () => {
  const { db, repository } = createRepository();
  saveProfile(repository, "alice", "alice-steps");
  saveProfile(repository, "bob", "bob-steps");

  assert.equal(db.prepare(`
    SELECT challenge_mate_discoverable AS discoverable
    FROM account_privacy_preferences WHERE user_id = 'bob'
  `).get()?.discoverable, 1);
  db.prepare(`
    UPDATE account_privacy_preferences SET challenge_mate_discoverable = 0 WHERE user_id = 'bob'
  `).run();

  assert.deepEqual(repository.getDashboard("alice").suggestions, []);
  db.close();
});
