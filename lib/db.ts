import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { ensureChallengeTypes } from "../infrastructure/sqlite/sqlite-challenge-types-migration.ts";
import { ensureChallengeMateSchema } from "../infrastructure/sqlite/sqlite-challenge-mate-migration.ts";
import { ensureRetentionSchema } from "../infrastructure/sqlite/sqlite-retention-migration.ts";
import { ensureUniqueUsernames } from "../infrastructure/sqlite/sqlite-usernames-migration.ts";
import { ensureAccountPrivacySchema } from "../infrastructure/sqlite/sqlite-account-privacy-migration.ts";

const globalForDb = globalThis as unknown as {
  challengeHubDb?: DatabaseSync;
};

export function getDb() {
  if (globalForDb.challengeHubDb) {
    return globalForDb.challengeHubDb;
  }

  const dbPath = process.env.CHALLENGEHUB_DB_PATH ?? path.join(process.cwd(), ".data", "challengehub.sqlite");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      name_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (expires_at > created_at)
    );

    CREATE INDEX IF NOT EXISTS password_reset_tokens_active_expiry_idx
      ON password_reset_tokens (expires_at)
      WHERE used_at IS NULL;

    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_created_idx
      ON password_reset_tokens (user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS password_reset_requests (
      id TEXT PRIMARY KEY,
      email_hash TEXT NOT NULL,
      ip_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS password_reset_requests_email_created_idx
      ON password_reset_requests (email_hash, created_at DESC);

    CREATE INDEX IF NOT EXISTS password_reset_requests_ip_created_idx
      ON password_reset_requests (ip_hash, created_at DESC);

    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id TEXT PRIMARY KEY,
      scope TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS rate_limit_events_scope_key_created_idx
      ON rate_limit_events (scope, key_hash, created_at DESC);

    CREATE INDEX IF NOT EXISTS rate_limit_events_created_idx
      ON rate_limit_events (created_at);

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      goal TEXT NOT NULL,
      description TEXT NOT NULL,
      rules_json TEXT NOT NULL,
      tips_json TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'public',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_id)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      UNIQUE (participation_id, date)
    );

    CREATE TABLE IF NOT EXISTS challenge_invitations (
      id TEXT PRIMARY KEY,
      inviter_participation_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      accepted_by_user_id TEXT,
      accepted_at TEXT,
      revoked_at TEXT,
      FOREIGN KEY (inviter_participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      FOREIGN KEY (accepted_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
      CHECK ((accepted_by_user_id IS NULL) = (accepted_at IS NULL)),
      CHECK (expires_at > created_at)
    );

    CREATE INDEX IF NOT EXISTS challenge_invitations_participation_created_idx
      ON challenge_invitations (inviter_participation_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS challenge_invitations_active_expiry_idx
      ON challenge_invitations (expires_at)
      WHERE accepted_at IS NULL AND revoked_at IS NULL;
  `);

  ensureUniqueUsernames(db);
  ensureChallengeTypes(db);
  ensureChallengeMateSchema(db);
  ensureRetentionSchema(db);
  ensureAccountPrivacySchema(db);

  globalForDb.challengeHubDb = db;
  return db;
}
