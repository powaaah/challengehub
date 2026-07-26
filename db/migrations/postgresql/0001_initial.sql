BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Fortgeschritten', 'Experte')),
  category TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days >= 0),
  goal TEXT NOT NULL,
  description TEXT NOT NULL,
  rules_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  tips_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'internal')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE participations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, challenge_id)
);

CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (participation_id, date)
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);
CREATE INDEX challenges_public_listing_idx
  ON challenges (created_at DESC)
  WHERE visibility = 'public' AND status = 'published';
CREATE INDEX participations_challenge_status_idx
  ON participations (challenge_id, status);
CREATE INDEX participations_user_started_idx
  ON participations (user_id, started_at DESC);
CREATE INDEX check_ins_participation_date_idx
  ON check_ins (participation_id, date);

INSERT INTO schema_migrations (version) VALUES ('0001_initial');

COMMIT;
