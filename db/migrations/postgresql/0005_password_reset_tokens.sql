BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMPTZ,
  CHECK (expires_at > created_at)
);

CREATE INDEX password_reset_tokens_active_expiry_idx
  ON password_reset_tokens (expires_at)
  WHERE used_at IS NULL;

CREATE INDEX password_reset_tokens_user_created_idx
  ON password_reset_tokens (user_id, created_at DESC);

INSERT INTO schema_migrations (version) VALUES ('0005_password_reset_tokens');

COMMIT;
