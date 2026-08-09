BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE challenges
  ALTER COLUMN status SET DEFAULT 'pending';

INSERT INTO schema_migrations (version) VALUES ('0008_pending_challenge_default');

COMMIT;
