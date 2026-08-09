import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { ensureChallengeMateSchema } from "../infrastructure/sqlite/sqlite-challenge-mate-migration.ts";
import { ensureRetentionSchema } from "../infrastructure/sqlite/sqlite-retention-migration.ts";
import { ensureAccountPrivacySchema } from "../infrastructure/sqlite/sqlite-account-privacy-migration.ts";
import { SqliteAccountDataRepository } from "../infrastructure/sqlite/sqlite-account-data-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      name_key TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL,
      email_verified_at TEXT
    );
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE password_reset_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, used_at TEXT
    );
    CREATE TABLE email_verification_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, used_at TEXT
    );
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY, creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT NOT NULL, title TEXT NOT NULL, level TEXT NOT NULL, category TEXT NOT NULL,
      duration_days INTEGER NOT NULL, goal TEXT NOT NULL, description TEXT NOT NULL,
      rules_json TEXT NOT NULL, tips_json TEXT NOT NULL, visibility TEXT NOT NULL,
      status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      challenge_type TEXT NOT NULL, metric_unit TEXT NOT NULL, target_value REAL NOT NULL,
      frequency TEXT NOT NULL, measurement_direction TEXT NOT NULL,
      completion_criterion TEXT NOT NULL
    );
    CREATE TABLE participations (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      started_at TEXT NOT NULL, status TEXT NOT NULL, completed_at TEXT,
      UNIQUE(user_id, challenge_id)
    );
    CREATE TABLE check_ins (
      id TEXT PRIMARY KEY, participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
      date TEXT NOT NULL, value REAL, note TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE challenge_invitations (
      id TEXT PRIMARY KEY,
      inviter_participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL,
      accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      accepted_at TEXT, revoked_at TEXT,
      CHECK ((accepted_by_user_id IS NULL) = (accepted_at IS NULL))
    );
    INSERT INTO users VALUES
      ('system', 'system@challengehub.local', 'ChallengeHub', '__system__', 'disabled:disabled', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('u1', 'ada@example.test', 'Ada', 'ada', 'salt:secret-hash', '2026-07-01T08:00:00.000Z', NULL),
      ('u2', 'ben@example.test', 'Ben', 'ben', 'salt:other-hash', '2026-07-02T08:00:00.000Z', NULL);
    INSERT INTO sessions VALUES ('s1', 'u1', 'session-secret', '2026-09-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z');
    INSERT INTO password_reset_tokens VALUES
      ('r1', 'u1', 'reset-secret', '2026-08-10T00:00:00.000Z', '2026-08-09T00:00:00.000Z', NULL);
    INSERT INTO email_verification_tokens VALUES
      ('v1', 'u1', 'verification-secret', '2026-08-10T00:00:00.000Z', '2026-08-09T00:00:00.000Z', NULL);
    INSERT INTO challenges VALUES
      ('c1', 'u1', 'ada-public', 'Adas Challenge', 'User', 'Alltag', 30, 'Dranbleiben', 'Beschreibung',
       '[]', '[]', 'public', 'published', '2026-07-01T08:00:00.000Z', '2026-07-01T08:00:00.000Z',
       'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in'),
      ('c2', 'u1', 'ada-pending', 'Adas Entwurf', 'User', 'Alltag', 30, 'Testen', 'Entwurf',
       '[]', '[]', 'public', 'pending', '2026-07-02T08:00:00.000Z', '2026-07-02T08:00:00.000Z',
       'daily_boolean', 'completion', 1, 'daily', 'at_least', 'daily_check_in');
    INSERT INTO participations VALUES
      ('p1', 'u1', 'c1', '2026-07-03T08:00:00.000Z', 'active', NULL),
      ('p2', 'u2', 'c1', '2026-07-04T08:00:00.000Z', 'active', NULL);
    INSERT INTO check_ins VALUES
      ('i1', 'p1', '2026-08-08', NULL, 'eigene Notiz', '2026-08-08T18:00:00.000Z'),
      ('i2', 'p2', '2026-08-08', NULL, NULL, '2026-08-08T19:00:00.000Z');
    INSERT INTO challenge_invitations VALUES
      ('invite-1', 'p2', 'invite-secret', '2026-08-20T00:00:00.000Z', '2026-08-08T00:00:00.000Z',
       'u1', '2026-08-08T01:00:00.000Z', NULL);
  `);
  ensureChallengeMateSchema(db);
  ensureRetentionSchema(db);
  ensureAccountPrivacySchema(db);
  return { db, repository: new SqliteAccountDataRepository(db) };
}

test("Privacy-Defaults sind nicht öffentlich und lassen sich granular aktualisieren", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.getPrivacyPreferences("u1", "2026-08-09T10:00:00.000Z"), {
    rankingVisible: false,
    activityVisible: false,
    challengeMateDiscoverable: false
  });
  assert.deepEqual(repository.updatePrivacyPreferences({
    userId: "u1",
    rankingVisible: true,
    activityVisible: false,
    challengeMateDiscoverable: true,
    updatedAt: "2026-08-09T11:00:00.000Z"
  }), { status: "updated" });
  assert.deepEqual(repository.getPrivacyPreferences("u1", "2026-08-09T12:00:00.000Z"), {
    rankingVisible: true,
    activityVisible: false,
    challengeMateDiscoverable: true
  });
  db.close();
});

test("JSON-Export enthält eigene Produktdaten, aber keine Passwort- oder Tokenwerte", () => {
  const { db, repository } = createRepository();
  repository.updatePrivacyPreferences({
    userId: "u1", rankingVisible: true, activityVisible: false,
    challengeMateDiscoverable: false, updatedAt: "2026-08-09T11:00:00.000Z"
  });

  const exported = repository.exportAccountData("u1", "2026-08-09T12:00:00.000Z");
  assert.equal(exported?.format, "challengehub-account-export-v1");
  assert.equal(exported?.account.email, "ada@example.test");
  assert.equal(exported?.account.emailVerifiedAt, null);
  assert.equal(exported?.emailVerifications[0]?.id, "v1");
  assert.equal(exported?.participations[0]?.checkIns[0]?.note, "eigene Notiz");
  assert.equal(exported?.createdChallenges[0]?.slug, "ada-public");
  assert.equal(exported?.acceptedInvitations[0]?.id, "invite-1");
  const serialized = JSON.stringify(exported);
  assert.doesNotMatch(serialized, /secret|passwordHash|tokenHash|nameKey/i);
  db.close();
});

test("Kontolöschung entfernt Personendaten und überträgt veröffentlichte Challenges ohne Fremddatenverlust", () => {
  const { db, repository } = createRepository();

  assert.deepEqual(repository.deleteAccountData({
    userId: "u1", auditId: "audit-1", deletedAt: "2026-08-09T12:00:00.000Z"
  }), { status: "deleted" });
  assert.equal(db.prepare("SELECT 1 FROM users WHERE id = 'u1'").get(), undefined);
  assert.equal(db.prepare("SELECT creator_id FROM challenges WHERE id = 'c1'").get()?.creator_id, "system");
  assert.equal(db.prepare("SELECT 1 FROM challenges WHERE id = 'c2'").get(), undefined);
  assert.equal(db.prepare("SELECT 1 FROM participations WHERE id = 'p2'").get() !== undefined, true);
  assert.deepEqual({ ...db.prepare(`
    SELECT accepted_by_user_id AS acceptedByUserId, accepted_at AS acceptedAt
    FROM challenge_invitations WHERE id = 'invite-1'
  `).get() }, { acceptedByUserId: null, acceptedAt: null });
  assert.deepEqual({ ...db.prepare(`
    SELECT id, deleted_at AS deletedAt, published_challenges_transferred AS publishedChallengesTransferred
    FROM account_deletion_audits
  `).get() }, {
    id: "audit-1",
    deletedAt: "2026-08-09T12:00:00.000Z",
    publishedChallengesTransferred: 1
  });
  assert.equal(JSON.stringify(db.prepare("SELECT * FROM account_deletion_audits").get()).includes("u1"), false);
  db.close();
});
