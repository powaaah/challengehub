BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_privacy_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ranking_visible BOOLEAN NOT NULL DEFAULT FALSE,
  activity_visible BOOLEAN NOT NULL DEFAULT FALSE,
  challenge_mate_discoverable BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE account_deletion_audits (
  id TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ NOT NULL,
  published_challenges_transferred INTEGER NOT NULL,
  retention_basis TEXT NOT NULL DEFAULT 'operational_deletion_evidence',
  CHECK (published_challenges_transferred >= 0),
  CHECK (retention_basis = 'operational_deletion_evidence')
);

INSERT INTO schema_migrations (version) VALUES ('0013_account_privacy');

COMMIT;
