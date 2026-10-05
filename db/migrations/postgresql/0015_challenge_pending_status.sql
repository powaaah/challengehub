BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE challenges
  DROP CONSTRAINT IF EXISTS challenges_status_check;

ALTER TABLE challenges
  ADD CONSTRAINT challenges_status_check
    CHECK (status IN ('pending', 'draft', 'published', 'archived'));

ALTER TABLE challenges
  ALTER COLUMN status SET DEFAULT 'pending';

INSERT INTO schema_migrations (version) VALUES ('0015_challenge_pending_status');

COMMIT;
