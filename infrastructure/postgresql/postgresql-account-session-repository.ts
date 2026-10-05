import type {
  Account,
  AccountSessionRepository,
  CreateAccountInput,
  CreateAccountResult,
  CreateSessionInput,
  CreateSessionResult,
  UpdateAccountNameResult
} from "../../domain/accounts/account-session-repository.ts";
import { getUsernameKey, normalizeUsername } from "../../domain/accounts/username.ts";
import type { PostgresQueryClient } from "./postgres-query-client.ts";

type Clock = () => string;

type AccountRow = {
  id: unknown;
  email: unknown;
  name: unknown;
  password_hash: unknown;
  created_at: unknown;
  email_verified_at: unknown;
};

const accountColumns = `users.id, users.email, users.name,
  users.password_hash, users.created_at, users.email_verified_at`;

export class PostgresqlAccountSessionRepository implements AccountSessionRepository {
  private readonly client: PostgresQueryClient;
  private readonly now: Clock;

  constructor(client: PostgresQueryClient, now: Clock = () => new Date().toISOString()) {
    this.client = client;
    this.now = now;
  }

  async findAccountById(userId: string): Promise<Account | null> {
    const result = await this.client.query(
      `SELECT ${accountColumns}
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return mapFirstAccount(result.rows);
  }

  async findAccountByEmail(email: string): Promise<Account | null> {
    const result = await this.client.query(
      `SELECT ${accountColumns}
       FROM users
       WHERE email = $1`,
      [normalizeEmail(email)]
    );
    return mapFirstAccount(result.rows);
  }

  async findAccountByLogin(identifier: string): Promise<Account | null> {
    const result = await this.client.query(
      `SELECT ${accountColumns}
       FROM users
       WHERE email = $1 OR name_key = $2
       LIMIT 1`,
      [normalizeEmail(identifier), getUsernameKey(identifier)]
    );
    return mapFirstAccount(result.rows);
  }

  async createAccount(input: CreateAccountInput): Promise<CreateAccountResult> {
    const email = normalizeEmail(input.email);
    const name = normalizeUsername(input.name);
    const createdAt = this.now();
    const result = await this.client.query(
      `INSERT INTO users (id, email, name, name_key, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::timestamptz)
       ON CONFLICT DO NOTHING
       RETURNING id, email, name, password_hash, created_at, email_verified_at`,
      [input.id, email, name, getUsernameKey(name), input.passwordHash, createdAt]
    );
    const account = mapFirstAccount(result.rows);
    return account ? { status: "created", account } : { status: "account_conflict" };
  }

  async updateAccountName(input: {
    userId: string;
    name: string;
  }): Promise<UpdateAccountNameResult> {
    const name = normalizeUsername(input.name);
    const nameKey = getUsernameKey(name);
    let result: { rows: unknown[] };
    try {
      result = await this.client.query(
        `UPDATE users
         SET name = $1, name_key = $2
         WHERE id = $3
           AND NOT EXISTS (
             SELECT 1 FROM users AS conflicting_user
             WHERE conflicting_user.name_key = $2 AND conflicting_user.id <> $3
           )
         RETURNING id`,
        [name, nameKey, input.userId]
      );
    } catch (error) {
      if (isUniqueViolation(error)) return { status: "account_conflict" };
      throw error;
    }
    if (result.rows.length === 1) return { status: "updated" };

    const user = await this.client.query(
      `SELECT 1 AS found
       FROM users
       WHERE id = $1`,
      [input.userId]
    );
    return user.rows.length === 0
      ? { status: "user_not_found" }
      : { status: "account_conflict" };
  }

  async findAccountBySessionTokenHash(tokenHash: string, now: string): Promise<Account | null> {
    const result = await this.client.query(
      `SELECT ${accountColumns}
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = $1
         AND sessions.expires_at > $2::timestamptz`,
      [tokenHash, now]
    );
    return mapFirstAccount(result.rows);
  }

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const result = await this.client.query(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
       SELECT $1, users.id, $3, $4::timestamptz, $5::timestamptz
       FROM users
       WHERE users.id = $2
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [input.id, input.userId, input.tokenHash, input.expiresAt, this.now()]
    );
    if (result.rows.length === 1) return { status: "created" };

    const user = await this.client.query(
      `SELECT 1 AS found
       FROM users
       WHERE id = $1`,
      [input.userId]
    );
    return user.rows.length === 0
      ? { status: "user_not_found" }
      : { status: "token_conflict" };
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<boolean> {
    const result = await this.client.query(
      `DELETE FROM sessions
       WHERE token_hash = $1
       RETURNING id`,
      [tokenHash]
    );
    return result.rows.length === 1;
  }
}

function mapFirstAccount(rows: unknown[]): Account | null {
  return rows.length === 0 ? null : mapAccount(rows[0] as AccountRow);
}

function mapAccount(row: AccountRow): Account {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    createdAt: toIsoString(row.created_at),
    emailVerifiedAt: row.email_verified_at == null ? null : toIsoString(row.email_verified_at)
  };
}

function toIsoString(value: unknown) {
  return value instanceof Date ? value.toISOString() : String(value);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && error.code === "23505";
}