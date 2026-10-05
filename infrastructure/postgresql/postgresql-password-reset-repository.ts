import type {
  CreatePasswordResetInput,
  CreatePasswordResetResult,
  PasswordResetRepository,
  ResetPasswordInput,
  ResetPasswordResult
} from "../../domain/accounts/password-reset-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type Clock = () => string;

export class PostgresqlPasswordResetRepository implements PasswordResetRepository {
  private readonly client: PostgresTransactionalQueryClient;
  private readonly now: Clock;

  constructor(
    client: PostgresTransactionalQueryClient,
    now: Clock = () => new Date().toISOString()
  ) {
    this.client = client;
    this.now = now;
  }

  async createForUser(input: CreatePasswordResetInput): Promise<CreatePasswordResetResult> {
    const result = await this.client.query(
      `WITH selected_user AS (
         SELECT id FROM users WHERE id = $2
       ), inserted AS (
         INSERT INTO password_reset_tokens (
           id, user_id, token_hash, expires_at, created_at, used_at
         )
         SELECT $1, id, $3, $4::timestamptz, $5::timestamptz, NULL
         FROM selected_user
         ON CONFLICT DO NOTHING
         RETURNING id
       )
       SELECT EXISTS (SELECT 1 FROM selected_user) AS user_exists,
         EXISTS (SELECT 1 FROM inserted) AS created`,
      [input.id, input.userId, input.tokenHash, input.expiresAt, this.now()]
    );
    const row = result.rows[0] as { user_exists?: boolean; created?: boolean } | undefined;
    if (!row?.user_exists) return { status: "user_not_found" };
    return { status: row.created ? "created" : "token_conflict" };
  }

  async confirmDelivery(input: { id: string; userId: string; deliveredAt: string }): Promise<void> {
    await this.client.transaction(async (transaction) => {
      const current = await transaction.query(
        `SELECT created_at
         FROM password_reset_tokens
         WHERE id = $1 AND user_id = $2 AND used_at IS NULL
         FOR UPDATE`,
        [input.id, input.userId]
      );
      const createdAt = (current.rows[0] as { created_at?: Date | string } | undefined)?.created_at;
      if (!createdAt) return;

      await transaction.query(
        `UPDATE password_reset_tokens
         SET used_at = $1::timestamptz
         WHERE user_id = $2 AND id <> $3 AND used_at IS NULL
           AND created_at < $4::timestamptz`,
        [input.deliveredAt, input.userId, input.id, toIso(createdAt)]
      );
    });
  }

  async discard(input: { id: string; userId: string }): Promise<void> {
    await this.client.query(
      `DELETE FROM password_reset_tokens WHERE id = $1 AND user_id = $2`,
      [input.id, input.userId]
    );
  }

  async isTokenActive(input: { tokenHash: string; now: string }): Promise<boolean> {
    const result = await this.client.query(
      `SELECT 1 AS active
       FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > $2::timestamptz`,
      [input.tokenHash, input.now]
    );
    return result.rows.length > 0;
  }

  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    return this.client.transaction(async (transaction) => {
      const consumed = await consumeToken(transaction, input);
      const userId = (consumed.rows[0] as { user_id?: string } | undefined)?.user_id;
      if (!userId) return { status: "invalid_token" };

      await transaction.query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [input.passwordHash, userId]
      );
      await transaction.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
      return { status: "reset" };
    });
  }
}

function consumeToken(client: PostgresQueryClient, input: ResetPasswordInput) {
  return client.query(
    `UPDATE password_reset_tokens
     SET used_at = $1::timestamptz
     WHERE token_hash = $2 AND used_at IS NULL AND expires_at > $1::timestamptz
     RETURNING user_id`,
    [input.now, input.tokenHash]
  );
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}