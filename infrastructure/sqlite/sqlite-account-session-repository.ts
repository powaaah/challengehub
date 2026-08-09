import type { DatabaseSync } from "node:sqlite";
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

type Clock = () => string;

type AccountRow = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export class SqliteAccountSessionRepository implements AccountSessionRepository {
  private readonly db: DatabaseSync;
  private readonly now: Clock;

  constructor(db: DatabaseSync, now: Clock = () => new Date().toISOString()) {
    this.db = db;
    this.now = now;
  }

  findAccountById(userId: string): Account | null {
    const row = this.db
      .prepare(`
        SELECT id, email, name, password_hash as passwordHash, created_at as createdAt
        FROM users
        WHERE id = ?
      `)
      .get(userId) as AccountRow | undefined;

    return row ? { ...row } : null;
  }

  findAccountByEmail(email: string): Account | null {
    const row = this.db
      .prepare(`
        SELECT id, email, name, password_hash as passwordHash, created_at as createdAt
        FROM users
        WHERE email = ?
      `)
      .get(normalizeEmail(email)) as AccountRow | undefined;

    return row ? { ...row } : null;
  }

  findAccountByLogin(identifier: string): Account | null {
    const normalized = identifier.trim().toLowerCase();
    const usernameKey = getUsernameKey(identifier);
    const row = this.db
      .prepare(`
        SELECT id, email, name, password_hash as passwordHash, created_at as createdAt
        FROM users
        WHERE email = ? OR name_key = ?
        LIMIT 1
      `)
      .get(normalized, usernameKey) as AccountRow | undefined;

    return row ? { ...row } : null;
  }

  createAccount(input: CreateAccountInput): CreateAccountResult {
    const email = normalizeEmail(input.email);
    const name = normalizeUsername(input.name);
    const nameKey = getUsernameKey(name);
    const createdAt = this.now();
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO users (id, email, name, name_key, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(input.id, email, name, nameKey, input.passwordHash, createdAt);

    if (insert.changes !== 1) {
      return { status: "account_conflict" };
    }

    return {
      status: "created",
      account: {
        id: input.id,
        email,
        name,
        passwordHash: input.passwordHash,
        createdAt
      }
    };
  }

  updateAccountName(input: { userId: string; name: string }): UpdateAccountNameResult {
    const name = normalizeUsername(input.name);
    const nameKey = getUsernameKey(name);
    const update = this.db
      .prepare(`
        UPDATE OR IGNORE users
        SET name = ?, name_key = ?
        WHERE id = ?
      `)
      .run(name, nameKey, input.userId);

    if (update.changes === 1) {
      return { status: "updated" };
    }

    const user = this.db.prepare("SELECT 1 FROM users WHERE id = ?").get(input.userId);
    return user ? { status: "account_conflict" } : { status: "user_not_found" };
  }

  findAccountBySessionTokenHash(tokenHash: string, now: string): Account | null {
    const row = this.db
      .prepare(`
        SELECT users.id, users.email, users.name,
          users.password_hash as passwordHash, users.created_at as createdAt
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      `)
      .get(tokenHash, now) as AccountRow | undefined;

    return row ? { ...row } : null;
  }

  createSession(input: CreateSessionInput): CreateSessionResult {
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO sessions (id, user_id, token_hash, expires_at, created_at)
        SELECT ?, users.id, ?, ?, ?
        FROM users
        WHERE users.id = ?
      `)
      .run(input.id, input.tokenHash, input.expiresAt, this.now(), input.userId);

    if (insert.changes === 1) {
      return { status: "created" };
    }

    const user = this.db.prepare("SELECT 1 FROM users WHERE id = ?").get(input.userId);
    return user ? { status: "token_conflict" } : { status: "user_not_found" };
  }

  deleteSessionByTokenHash(tokenHash: string): boolean {
    return this.db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash).changes === 1;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
