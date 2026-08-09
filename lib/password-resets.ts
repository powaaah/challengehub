import { randomBytes, randomUUID } from "node:crypto";
import { SqlitePasswordResetRepository } from "../infrastructure/sqlite/sqlite-password-reset-repository";
import { findAccountByEmail } from "./accounts";
import { hashPassword } from "./auth";
import { getDb } from "./db";
import { sendPasswordResetEmail } from "./password-reset-email";
import { requestPasswordReset, resetPasswordWithToken } from "./password-reset";
import { SITE_URL } from "./seo";

function getPasswordResetRepository() {
  return new SqlitePasswordResetRepository(getDb());
}

export function requestPasswordResetForEmail(email: string) {
  const repository = getPasswordResetRepository();

  return requestPasswordReset({
    email,
    now: new Date(),
    findAccountByEmail,
    createToken: (input) => repository.createForUser(input),
    confirmDelivery: (input) => repository.confirmDelivery(input),
    discardToken: (input) => repository.discard(input),
    generateToken: () => randomBytes(32).toString("base64url"),
    generateId: randomUUID,
    siteUrl: SITE_URL,
    deliver: async (message) => {
      const result = await sendPasswordResetEmail(message);
      if (result.status !== "delivered") {
        throw new Error("Password reset email delivery unavailable");
      }
    }
  });
}

export function resetPasswordForToken(token: string, password: string) {
  const repository = getPasswordResetRepository();

  return resetPasswordWithToken({
    token,
    password,
    now: new Date(),
    isTokenActive: (input) => repository.isTokenActive(input),
    hashPassword,
    resetPassword: (input) => repository.resetPassword(input)
  });
}
