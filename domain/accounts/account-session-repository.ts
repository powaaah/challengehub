export type Account = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type CreateAccountInput = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

export type CreateAccountResult =
  | { status: "created"; account: Account }
  | { status: "account_conflict" };

export type CreateSessionInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
};

export type CreateSessionResult =
  | { status: "created" }
  | { status: "user_not_found" | "token_conflict" };

export type UpdateAccountNameResult =
  | { status: "updated" }
  | { status: "account_conflict" | "user_not_found" };

export interface AccountSessionRepository {
  findAccountByEmail(email: string): Account | null;
  findAccountByLogin(identifier: string): Account | null;
  createAccount(input: CreateAccountInput): CreateAccountResult;
  updateAccountName(input: { userId: string; name: string }): UpdateAccountNameResult;
  findAccountBySessionTokenHash(tokenHash: string, now: string): Account | null;
  createSession(input: CreateSessionInput): CreateSessionResult;
  deleteSessionByTokenHash(tokenHash: string): boolean;
}
