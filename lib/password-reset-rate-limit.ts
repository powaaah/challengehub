import { createHmac, randomBytes, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { resolveRateLimitSecret } from "../domain/security/rate-limit.ts";
import { getDb } from "./db.ts";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_EMAIL_REQUESTS = 3;
const MAX_IP_REQUESTS = 10;
const runtimeSecret = randomBytes(32);

type RateLimitInput = {
  email: string;
  ip: string;
  now?: Date;
  generateId?: () => string;
  secret?: string | Buffer;
};

export function allowPasswordResetRequest(input: RateLimitInput) {
  return consumePasswordResetRateLimit(getDb(), input);
}

export function consumePasswordResetRateLimit(db: DatabaseSync, input: RateLimitInput) {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const windowStart = new Date(now.getTime() - WINDOW_MS).toISOString();
  const secret = input.secret ?? resolveRateLimitSecret({
    nodeEnv: process.env.NODE_ENV,
    configuredSecret: process.env.PASSWORD_RESET_RATE_LIMIT_SECRET ?? process.env.RATE_LIMIT_SECRET,
    fallbackSecret: runtimeSecret
  });
  const emailHash = hashIdentifier(input.email.trim().toLowerCase(), secret);
  const ipHash = hashIdentifier(input.ip || "unknown", secret);

  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM password_reset_requests WHERE created_at < ?").run(windowStart);
    const emailCount = countRequests(db, "email_hash", emailHash, windowStart);
    const ipCount = countRequests(db, "ip_hash", ipHash, windowStart);

    if (emailCount >= MAX_EMAIL_REQUESTS || ipCount >= MAX_IP_REQUESTS) {
      db.exec("COMMIT");
      return false;
    }

    db.prepare(`
      INSERT INTO password_reset_requests (id, email_hash, ip_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run((input.generateId ?? randomUUID)(), emailHash, ipHash, nowIso);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function countRequests(db: DatabaseSync, column: "email_hash" | "ip_hash", value: string, windowStart: string) {
  const row = db
    .prepare(`SELECT COUNT(*) AS count FROM password_reset_requests WHERE ${column} = ? AND created_at >= ?`)
    .get(value, windowStart) as { count: number };
  return row.count;
}

function hashIdentifier(value: string, secret: string | Buffer) {
  return createHmac("sha256", secret).update(value).digest("hex");
}
