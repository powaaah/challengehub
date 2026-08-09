import { randomBytes, randomUUID } from "node:crypto";
import { SqliteEmailVerificationRepository } from "../infrastructure/sqlite/sqlite-email-verification-repository";
import { findAccountByEmail } from "./accounts";
import { getDb } from "./db";
import { requestEmailVerification, verifyEmailToken } from "./email-verification";
import { sendEmailVerificationEmail } from "./email-verification-email";
import { SITE_URL } from "./seo";

function getRepository() {
  return new SqliteEmailVerificationRepository(getDb());
}

export function requestEmailVerificationForEmail(email: string) {
  const repository = getRepository();
  return requestEmailVerification({
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
      const result = await sendEmailVerificationEmail(message);
      if (result.status !== "delivered") throw new Error("Email verification delivery unavailable");
    }
  });
}

export function verifyEmailForToken(token: string) {
  const repository = getRepository();
  return verifyEmailToken({
    token,
    now: new Date(),
    verify: (input) => repository.verifyEmail(input)
  });
}
