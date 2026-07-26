import type { DatabaseSync } from "node:sqlite";
import type {
  Account,
  AccountSessionRepository,
  CreateAccountInput,
  CreateAccountResult,
  CreateSessionInput,
  CreateSessionResult
} from "../../domain/accounts/account-session-repository.ts";

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
    const row = this.db
      .prepare(`
        SELECT id, email, name, password_hash as passwordHash, created_at as createdAt
        FROM users
        WHERE email = ? OR lower(name) = ?
        LIMIT 1
      `)
      .get(normalized, normalized) as AccountRow | undefined;

    return row ? { ...row } : null;
  }

  createAccount(input: CreateAccountInput): CreateAccountResult {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const createdAt = this.now();
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO users (id, email, name, password_hash, created_at)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM users WHERE lower(name) = lower(?)
        )
      `)
      .run(input.id, email, name, input.passwordHash, createdAt, name);

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
