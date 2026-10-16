BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_completion_times (
  participation_id TEXT PRIMARY KEY REFERENCES participations(id) ON DELETE CASCADE,
  seconds DOUBLE PRECISION NOT NULL CHECK (seconds >= 1 AND seconds <= 604800),
  updated_at TIMESTAMPTZ NOT NULL
);

INSERT INTO schema_migrations (version) VALUES ('0017_completion_times');

COMMIT;
