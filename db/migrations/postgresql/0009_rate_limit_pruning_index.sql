BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX rate_limit_events_created_idx
  ON rate_limit_events (created_at);

INSERT INTO schema_migrations (version) VALUES ('0009_rate_limit_pruning_index');

COMMIT;
