import type { DatabaseSync } from "node:sqlite";

export function ensureAccountPrivacySchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_privacy_preferences (
      user_id TEXT PRIMARY KEY,
      ranking_visible INTEGER NOT NULL DEFAULT 0,
      activity_visible INTEGER NOT NULL DEFAULT 0,
      challenge_mate_discoverable INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (ranking_visible IN (0, 1)),
      CHECK (activity_visible IN (0, 1)),
      CHECK (challenge_mate_discoverable IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS account_deletion_audits (
      id TEXT PRIMARY KEY,
      deleted_at TEXT NOT NULL,
      published_challenges_transferred INTEGER NOT NULL,
      retention_basis TEXT NOT NULL DEFAULT 'operational_deletion_evidence',
      CHECK (published_challenges_transferred >= 0),
      CHECK (retention_basis = 'operational_deletion_evidence')
    );
  `);
}
