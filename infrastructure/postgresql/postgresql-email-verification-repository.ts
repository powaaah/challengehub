import type {
  CreateEmailVerificationInput,
  CreateEmailVerificationResult,
  EmailVerificationRepository,
  VerifyEmailResult
} from "../../domain/accounts/email-verification-repository.ts";
import type { PostgresTransactionalQueryClient } from "./postgres-query-client.ts";

type Clock = () => string;

export class PostgresqlEmailVerificationRepository implements EmailVerificationRepository {
  private readonly client: PostgresTransactionalQueryClient;
  private readonly now: Clock;

  constructor(
    client: PostgresTransactionalQueryClient,
    now: Clock = () => new Date().toISOString()
  ) {
    this.client = client;
    this.now = now;
  }

  async createForUser(input: CreateEmailVerificationInput): Promise<CreateEmailVerificationResult> {
    const result = await this.client.query(
      `WITH selected_user AS (
         SELECT id, email_verified_at FROM users WHERE id = $2
       ), inserted AS (
         INSERT INTO email_verification_tokens (
           id, user_id, token_hash, expires_at, created_at, used_at
         )
         SELECT $1, id, $3, $4::timestamptz, $5::timestamptz, NULL
         FROM selected_user
         WHERE email_verified_at IS NULL
         ON CONFLICT DO NOTHING
         RETURNING id
       )
       SELECT EXISTS (SELECT 1 FROM selected_user) AS user_exists,
         EXISTS (SELECT 1 FROM selected_user WHERE email_verified_at IS NOT NULL) AS already_verified,
         EXISTS (SELECT 1 FROM inserted) AS created`,
      [input.id, input.userId, input.tokenHash, input.expiresAt, this.now()]
    );
    const row = result.rows[0] as {
      user_exists?: boolean;
      already_verified?: boolean;
      created?: boolean;
    } | undefined;
    if (!row?.user_exists) return { status: "user_not_found" };
    if (row.already_verified) return { status: "already_verified" };
    return { status: row.created ? "created" : "token_conflict" };
  }

  async confirmDelivery(input: { id: string; userId: string; deliveredAt: string }): Promise<void> {
    await this.client.transaction(async (transaction) => {
      const current = await transaction.query(
        `SELECT created_at
         FROM email_verification_tokens
         WHERE id = $1 AND user_id = $2 AND used_at IS NULL
         FOR UPDATE`,
        [input.id, input.userId]
      );
      const createdAt = (current.rows[0] as { created_at?: Date | string } | undefined)?.created_at;
      if (!createdAt) return;

      await transaction.query(
        `UPDATE email_verification_tokens
         SET used_at = $1::timestamptz
         WHERE user_id = $2 AND id <> $3 AND used_at IS NULL
           AND created_at < $4::timestamptz`,
        [input.deliveredAt, input.userId, input.id, toIso(createdAt)]
      );
    });
  }

  async discard(input: { id: string; userId: string }): Promise<void> {
    await this.client.query(
      `DELETE FROM email_verification_tokens WHERE id = $1 AND user_id = $2`,
      [input.id, input.userId]
    );
  }

  async verifyEmail(input: { tokenHash: string; now: string }): Promise<VerifyEmailResult> {
    return this.client.transaction(async (transaction) => {
      const consumed = await transaction.query(
        `UPDATE email_verification_tokens
         SET used_at = $1::timestamptz
         WHERE token_hash = $2 AND used_at IS NULL AND expires_at > $1::timestamptz
         RETURNING user_id`,
        [input.now, input.tokenHash]
      );
      const userId = (consumed.rows[0] as { user_id?: string } | undefined)?.user_id;
      if (!userId) return { status: "invalid_token" };

      const verified = await transaction.query(
        `UPDATE users
         SET email_verified_at = $1::timestamptz
         WHERE id = $2 AND email_verified_at IS NULL
         RETURNING id`,
        [input.now, userId]
      );
      if (verified.rows.length === 0) return { status: "already_verified" };

      await transaction.query(
        `UPDATE email_verification_tokens
         SET used_at = $1::timestamptz
         WHERE user_id = $2 AND used_at IS NULL`,
        [input.now, userId]
      );
      return { status: "verified" };
    });
  }
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}