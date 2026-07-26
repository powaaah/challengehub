BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_requests (
  id TEXT PRIMARY KEY,
  email_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX password_reset_requests_email_created_idx
  ON password_reset_requests (email_hash, created_at DESC);

CREATE INDEX password_reset_requests_ip_created_idx
  ON password_reset_requests (ip_hash, created_at DESC);

INSERT INTO schema_migrations (version) VALUES ('0006_password_reset_rate_limits');

COMMIT;
