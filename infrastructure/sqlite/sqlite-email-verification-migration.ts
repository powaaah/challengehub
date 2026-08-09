import type { DatabaseSync } from "node:sqlite";

export function ensureEmailVerificationSchema(db: DatabaseSync) {
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  if (!userColumns.some((column) => column.name === "email_verified_at")) {
    db.exec("ALTER TABLE users ADD COLUMN email_verified_at TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (expires_at > created_at)
    );

    CREATE INDEX IF NOT EXISTS email_verification_tokens_active_expiry_idx
      ON email_verification_tokens (expires_at)
      WHERE used_at IS NULL;

    CREATE INDEX IF NOT EXISTS email_verification_tokens_user_created_idx
      ON email_verification_tokens (user_id, created_at DESC);
  `);
}
