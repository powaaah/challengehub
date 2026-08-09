BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE retention_preferences (
  participation_id TEXT PRIMARY KEY REFERENCES participations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  weekly_recap_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, participation_id)
);

CREATE INDEX retention_preferences_email_idx
  ON retention_preferences (email_reminder_enabled, weekly_recap_enabled, participation_id);

CREATE TABLE retention_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
  source_key TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  email_delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, source_key),
  CHECK (type IN ('daily_reminder', 'weekly_recap', 'mate_request', 'mate_matched', 'reactivation', 'completion_badge'))
);

CREATE INDEX retention_notifications_user_feed_idx
  ON retention_notifications (user_id, occurred_at DESC);

CREATE INDEX retention_notifications_pending_email_idx
  ON retention_notifications (type, occurred_at)
  WHERE email_delivered_at IS NULL;

INSERT INTO schema_migrations (version) VALUES ('0012_retention_notifications');

COMMIT;
