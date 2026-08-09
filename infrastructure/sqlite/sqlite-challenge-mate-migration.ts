import type { DatabaseSync } from "node:sqlite";

export function ensureChallengeMateSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenge_mate_profiles (
      user_id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      goal TEXT NOT NULL,
      available_from TEXT NOT NULL,
      available_until TEXT NOT NULL,
      mode TEXT NOT NULL,
      location TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      CHECK (mode IN ('remote', 'local')),
      CHECK ((mode = 'remote' AND location IS NULL) OR (mode = 'local' AND location IS NOT NULL)),
      CHECK (available_from <= available_until)
    );

    CREATE INDEX IF NOT EXISTS challenge_mate_profiles_active_dates_idx
      ON challenge_mate_profiles (active, available_from, available_until);

    CREATE TABLE IF NOT EXISTS challenge_mate_connections (
      id TEXT PRIMARY KEY,
      requester_user_id TEXT NOT NULL,
      recipient_user_id TEXT NOT NULL,
      user_low_id TEXT NOT NULL,
      user_high_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      matched_at TEXT,
      FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_low_id, user_high_id),
      CHECK (requester_user_id <> recipient_user_id),
      CHECK (user_low_id < user_high_id),
      CHECK (status IN ('pending', 'matched', 'blocked')),
      CHECK ((status = 'matched') = (matched_at IS NOT NULL))
    );

    CREATE INDEX IF NOT EXISTS challenge_mate_connections_recipient_status_idx
      ON challenge_mate_connections (recipient_user_id, status, created_at DESC);

    CREATE TABLE IF NOT EXISTS challenge_mate_blocks (
      blocker_user_id TEXT NOT NULL,
      blocked_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (blocker_user_id, blocked_user_id),
      FOREIGN KEY (blocker_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (blocker_user_id <> blocked_user_id)
    );

    CREATE TABLE IF NOT EXISTS challenge_mate_reports (
      id TEXT PRIMARY KEY,
      reporter_user_id TEXT NOT NULL,
      reported_user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (reporter_user_id <> reported_user_id),
      CHECK (reason IN ('spam', 'inappropriate', 'safety', 'other')),
      CHECK (status IN ('open', 'reviewed', 'dismissed'))
    );
  `);
}
