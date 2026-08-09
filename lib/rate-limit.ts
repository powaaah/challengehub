import { randomBytes } from "node:crypto";
import { consumeRateLimit, resolveRateLimitSecret } from "@/domain/security/rate-limit";
import { getDb } from "./db";

const runtimeSecret = randomBytes(32);
const RATE_LIMIT_RETENTION_MS = 24 * 60 * 60 * 1_000;

export const RATE_LIMIT_POLICIES = {
  loginIdentifier: { scope: "login:identifier", limit: 5, windowMs: 15 * 60 * 1_000 },
  loginIp: { scope: "login:ip", limit: 30, windowMs: 15 * 60 * 1_000 },
  registerEmail: { scope: "register:email", limit: 3, windowMs: 60 * 60 * 1_000 },
  registerIp: { scope: "register:ip", limit: 20, windowMs: 60 * 60 * 1_000 },
  passwordResetToken: { scope: "password-reset:token", limit: 5, windowMs: 60 * 60 * 1_000 },
  passwordResetIp: { scope: "password-reset:ip", limit: 20, windowMs: 60 * 60 * 1_000 },
  challengeCreate: { scope: "challenge:create", limit: 5, windowMs: 24 * 60 * 60 * 1_000 },
  challengeStart: { scope: "challenge:start", limit: 30, windowMs: 60 * 60 * 1_000 },
  invitationAccept: { scope: "invitation:accept", limit: 30, windowMs: 60 * 60 * 1_000 },
  invitationCreate: { scope: "invitation:create", limit: 20, windowMs: 60 * 60 * 1_000 },
  checkIn: { scope: "check-in:create", limit: 120, windowMs: 60 * 60 * 1_000 }
} as const;

type RateLimitPolicy = (typeof RATE_LIMIT_POLICIES)[keyof typeof RATE_LIMIT_POLICIES];

type RateLimitCheck = {
  policy: RateLimitPolicy;
  identifier: string;
};

export function allowRateLimitedAction(checks: RateLimitCheck[]) {
  const secret = resolveRateLimitSecret({
    nodeEnv: process.env.NODE_ENV,
    configuredSecret: process.env.RATE_LIMIT_SECRET,
    fallbackSecret: runtimeSecret
  });
  const db = getDb();
  let allowed = true;

  for (const check of checks) {
    if (!consumeRateLimit(db, {
      ...check.policy,
      identifier: check.identifier,
      secret,
      retentionMs: RATE_LIMIT_RETENTION_MS
    })) {
      allowed = false;
    }
  }

  return allowed;
}
