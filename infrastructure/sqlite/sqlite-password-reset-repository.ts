import type { DatabaseSync } from "node:sqlite";
import type {
  CreatePasswordResetInput,
  CreatePasswordResetResult,
  PasswordResetRepository,
  ResetPasswordInput,
  ResetPasswordResult
} from "../../domain/accounts/password-reset-repository.ts";

type Clock = () => string;

export class SqlitePasswordResetRepository implements PasswordResetRepository {
  private readonly db: DatabaseSync;
  private readonly now: Clock;

  constructor(
    db: DatabaseSync,
    now: Clock = () => new Date().toISOString()
  ) {
    this.db = db;
    this.now = now;
  }

  createForUser(input: CreatePasswordResetInput): CreatePasswordResetResult {
    const user = this.db.prepare("SELECT 1 FROM users WHERE id = ?").get(input.userId);
    if (!user) {
      return { status: "user_not_found" };
    }

    const createdAt = this.now();
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const insert = this.db
        .prepare(`
          INSERT OR IGNORE INTO password_reset_tokens (
            id, user_id, token_hash, expires_at, created_at, used_at
          ) VALUES (?, ?, ?, ?, ?, NULL)
        `)
        .run(input.id, input.userId, input.tokenHash, input.expiresAt, createdAt);

      if (insert.changes !== 1) {
        this.db.exec("ROLLBACK");
        return { status: "token_conflict" };
      }

      this.db.exec("COMMIT");
      return { status: "created" };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  confirmDelivery(input: { id: string; userId: string; deliveredAt: string }) {
    this.db
      .prepare(`
        UPDATE password_reset_tokens
        SET used_at = ?
        WHERE rowid IN (
          SELECT older.rowid
          FROM password_reset_tokens older
          JOIN password_reset_tokens current
            ON current.id = ? AND current.user_id = ? AND current.used_at IS NULL
          WHERE older.user_id = current.user_id
            AND older.id <> current.id
            AND older.used_at IS NULL
            AND (
              older.created_at < current.created_at
              OR (older.created_at = current.created_at AND older.rowid < current.rowid)
            )
          )
      `)
      .run(input.deliveredAt, input.id, input.userId);
  }

  discard(input: { id: string; userId: string }) {
    this.db
      .prepare("DELETE FROM password_reset_tokens WHERE id = ? AND user_id = ?")
      .run(input.id, input.userId);
  }

  isTokenActive(input: { tokenHash: string; now: string }) {
    return Boolean(this.db
      .prepare(`
        SELECT 1
        FROM password_reset_tokens
        WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
      `)
      .get(input.tokenHash, input.now));
  }

  resetPassword(input: ResetPasswordInput): ResetPasswordResult {
    const token = this.db
      .prepare(`
        SELECT user_id AS userId
        FROM password_reset_tokens
        WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
      `)
      .get(input.tokenHash, input.now) as { userId: string } | undefined;

    if (!token) {
      return { status: "invalid_token" };
    }

    this.db.exec("BEGIN IMMEDIATE");
    try {
      const consumed = this.db
        .prepare(`
          UPDATE password_reset_tokens
          SET used_at = ?
          WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
        `)
        .run(input.now, input.tokenHash, input.now);

      if (consumed.changes !== 1) {
        this.db.exec("ROLLBACK");
        return { status: "invalid_token" };
      }

      this.db
        .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
        .run(input.passwordHash, token.userId);
      this.db.prepare("DELETE FROM sessions WHERE user_id = ?").run(token.userId);
      this.db.exec("COMMIT");
      return { status: "reset" };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}
