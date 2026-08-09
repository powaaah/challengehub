BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE challenge_mate_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  available_from DATE NOT NULL,
  available_until DATE NOT NULL,
  mode TEXT NOT NULL,
  location TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL,
  CHECK (char_length(goal) BETWEEN 20 AND 200),
  CHECK (available_from <= available_until),
  CHECK (mode IN ('remote', 'local')),
  CHECK ((mode = 'remote' AND location IS NULL) OR (mode = 'local' AND location IS NOT NULL))
);

CREATE INDEX challenge_mate_profiles_active_dates_idx
  ON challenge_mate_profiles (active, available_from, available_until);

CREATE TABLE challenge_mate_connections (
  id TEXT PRIMARY KEY,
  requester_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_low_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_high_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL,
  matched_at TIMESTAMPTZ,
  UNIQUE (user_low_id, user_high_id),
  CHECK (requester_user_id <> recipient_user_id),
  CHECK (user_low_id < user_high_id),
  CHECK (status IN ('pending', 'matched', 'blocked')),
  CHECK ((status = 'matched') = (matched_at IS NOT NULL))
);

CREATE INDEX challenge_mate_connections_recipient_status_idx
  ON challenge_mate_connections (recipient_user_id, status, created_at DESC);

CREATE TABLE challenge_mate_blocks (
  blocker_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);

CREATE TABLE challenge_mate_reports (
  id TEXT PRIMARY KEY,
  reporter_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL,
  CHECK (reporter_user_id <> reported_user_id),
  CHECK (reason IN ('spam', 'inappropriate', 'safety', 'other')),
  CHECK (status IN ('open', 'reviewed', 'dismissed'))
);

INSERT INTO schema_migrations (version) VALUES ('0011_challenge_mates');

COMMIT;
