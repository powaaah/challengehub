BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_invitations (
  id TEXT PRIMARY KEY,
  inviter_participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  accepted_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  CHECK ((accepted_by_user_id IS NULL) = (accepted_at IS NULL)),
  CHECK (accepted_at IS NULL OR accepted_at >= created_at),
  CHECK (revoked_at IS NULL OR revoked_at >= created_at),
  CHECK (expires_at > created_at)
);

CREATE INDEX challenge_invitations_participation_created_idx
  ON challenge_invitations (inviter_participation_id, created_at DESC);
CREATE INDEX challenge_invitations_active_expiry_idx
  ON challenge_invitations (expires_at)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

INSERT INTO schema_migrations (version) VALUES ('0002_challenge_invitations');

COMMIT;
