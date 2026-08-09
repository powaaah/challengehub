import type { DatabaseSync } from "node:sqlite";
import type {
  CreateEmailVerificationInput,
  CreateEmailVerificationResult,
  EmailVerificationRepository,
  VerifyEmailResult
} from "../../domain/accounts/email-verification-repository.ts";

type Clock = () => string;

export class SqliteEmailVerificationRepository implements EmailVerificationRepository {
  private readonly db: DatabaseSync;
  private readonly now: Clock;

  constructor(
    db: DatabaseSync,
    now: Clock = () => new Date().toISOString()
  ) {
    this.db = db;
    this.now = now;
  }

  createForUser(input: CreateEmailVerificationInput): CreateEmailVerificationResult {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const user = this.db.prepare(`
        SELECT email_verified_at AS emailVerifiedAt FROM users WHERE id = ?
      `).get(input.userId) as { emailVerifiedAt: string | null } | undefined;
      if (!user) {
        this.db.exec("ROLLBACK");
        return { status: "user_not_found" };
      }
      if (user.emailVerifiedAt) {
        this.db.exec("ROLLBACK");
        return { status: "already_verified" };
      }

      const insert = this.db.prepare(`
        INSERT OR IGNORE INTO email_verification_tokens (
          id, user_id, token_hash, expires_at, created_at, used_at
        ) VALUES (?, ?, ?, ?, ?, NULL)
      `).run(input.id, input.userId, input.tokenHash, input.expiresAt, this.now());
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
    this.db.prepare(`
      UPDATE email_verification_tokens
      SET used_at = ?
      WHERE rowid IN (
        SELECT older.rowid
        FROM email_verification_tokens older
        JOIN email_verification_tokens current
          ON current.id = ? AND current.user_id = ? AND current.used_at IS NULL
        WHERE older.user_id = current.user_id
          AND older.id <> current.id
          AND older.used_at IS NULL
          AND (
            older.created_at < current.created_at
            OR (older.created_at = current.created_at AND older.rowid < current.rowid)
          )
      )
    `).run(input.deliveredAt, input.id, input.userId);
  }

  discard(input: { id: string; userId: string }) {
    this.db.prepare(`
      DELETE FROM email_verification_tokens WHERE id = ? AND user_id = ?
    `).run(input.id, input.userId);
  }

  verifyEmail(input: { tokenHash: string; now: string }): VerifyEmailResult {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const token = this.db.prepare(`
        SELECT tokens.user_id AS userId, users.email_verified_at AS emailVerifiedAt
        FROM email_verification_tokens tokens
        JOIN users ON users.id = tokens.user_id
        WHERE tokens.token_hash = ? AND tokens.used_at IS NULL AND tokens.expires_at > ?
      `).get(input.tokenHash, input.now) as {
        userId: string;
        emailVerifiedAt: string | null;
      } | undefined;
      if (!token) {
        this.db.exec("ROLLBACK");
        return { status: "invalid_token" };
      }

      const consumed = this.db.prepare(`
        UPDATE email_verification_tokens SET used_at = ?
        WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
      `).run(input.now, input.tokenHash, input.now);
      if (consumed.changes !== 1) {
        this.db.exec("ROLLBACK");
        return { status: "invalid_token" };
      }
      if (token.emailVerifiedAt) {
        this.db.exec("COMMIT");
        return { status: "already_verified" };
      }

      this.db.prepare(`
        UPDATE users SET email_verified_at = ? WHERE id = ? AND email_verified_at IS NULL
      `).run(input.now, token.userId);
      this.db.prepare(`
        UPDATE email_verification_tokens SET used_at = ?
        WHERE user_id = ? AND used_at IS NULL
      `).run(input.now, token.userId);
      this.db.exec("COMMIT");
      return { status: "verified" };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}
