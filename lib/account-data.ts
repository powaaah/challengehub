import { randomUUID } from "node:crypto";
import type { AccountPrivacyPreferences } from "../domain/accounts/account-data-repository";
import { confirmAccountDeletion } from "../domain/accounts/account-deletion";
import { SqliteAccountDataRepository } from "../infrastructure/sqlite/sqlite-account-data-repository";
import { findAccountById } from "./accounts";
import { verifyPassword } from "./auth";
import { getDb } from "./db";

function getAccountDataRepository() {
  return new SqliteAccountDataRepository(getDb());
}

export function getAccountPrivacyPreferences(userId: string) {
  return getAccountDataRepository().getPrivacyPreferences(userId, new Date().toISOString());
}

export function updateAccountPrivacyPreferences(
  userId: string,
  preferences: AccountPrivacyPreferences
) {
  return getAccountDataRepository().updatePrivacyPreferences({
    userId,
    ...preferences,
    updatedAt: new Date().toISOString()
  });
}

export function exportAccountData(userId: string) {
  return getAccountDataRepository().exportAccountData(userId, new Date().toISOString());
}

export function deleteAccountWithPassword(userId: string, password: string) {
  const repository = getAccountDataRepository();
  return confirmAccountDeletion({
    userId,
    password,
    findAccount: findAccountById,
    verifyPassword,
    deleteAccount: (accountId) => repository.deleteAccountData({
      userId: accountId,
      auditId: randomUUID(),
      deletedAt: new Date().toISOString()
    })
  });
}
