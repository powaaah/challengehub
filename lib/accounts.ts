import type {
  AccountSessionRepository,
  CreateAccountInput,
  CreateAccountResult,
  CreateSessionInput,
  CreateSessionResult
} from "../domain/accounts/account-session-repository";
import { SqliteAccountSessionRepository } from "../infrastructure/sqlite/sqlite-account-session-repository";
import { getDb } from "./db";

function getAccountSessionRepository(): AccountSessionRepository {
  return new SqliteAccountSessionRepository(getDb());
}

export function findAccountById(userId: string) {
  return getAccountSessionRepository().findAccountById(userId);
}

export function findAccountByEmail(email: string) {
  return getAccountSessionRepository().findAccountByEmail(email);
}

export function findAccountByLogin(identifier: string) {
  return getAccountSessionRepository().findAccountByLogin(identifier);
}

export function createAccount(input: CreateAccountInput): CreateAccountResult {
  return getAccountSessionRepository().createAccount(input);
}

export function updateAccountName(userId: string, name: string) {
  return getAccountSessionRepository().updateAccountName({ userId, name });
}

export function findAccountBySessionTokenHash(tokenHash: string, now: string) {
  return getAccountSessionRepository().findAccountBySessionTokenHash(tokenHash, now);
}

export function createAccountSession(input: CreateSessionInput): CreateSessionResult {
  return getAccountSessionRepository().createSession(input);
}

export function deleteAccountSessionByTokenHash(tokenHash: string) {
  return getAccountSessionRepository().deleteSessionByTokenHash(tokenHash);
}
