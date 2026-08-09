import type { DatabaseSync } from "node:sqlite";

export function ensureRetentionSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS retention_preferences (
      participation_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      in_app_enabled INTEGER NOT NULL DEFAULT 1,
      email_reminder_enabled INTEGER NOT NULL DEFAULT 0,
      weekly_recap_enabled INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, participation_id),
      CHECK (in_app_enabled IN (0, 1)),
      CHECK (email_reminder_enabled IN (0, 1)),
      CHECK (weekly_recap_enabled IN (0, 1))
    );

    CREATE INDEX IF NOT EXISTS retention_preferences_email_idx
      ON retention_preferences (email_reminder_enabled, weekly_recap_enabled, participation_id);

    CREATE TABLE IF NOT EXISTS retention_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      participation_id TEXT NOT NULL,
      source_key TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      href TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      read_at TEXT,
      email_delivered_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      UNIQUE (user_id, source_key),
      CHECK (type IN ('daily_reminder', 'weekly_recap', 'mate_request', 'mate_matched', 'reactivation', 'completion_badge'))
    );

    CREATE INDEX IF NOT EXISTS retention_notifications_user_feed_idx
      ON retention_notifications (user_id, occurred_at DESC);

    CREATE INDEX IF NOT EXISTS retention_notifications_pending_email_idx
      ON retention_notifications (type, occurred_at)
      WHERE email_delivered_at IS NULL;
  `);
}
