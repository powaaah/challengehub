import { createHmac, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

type ConsumeRateLimitInput = {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
  retentionMs?: number;
  secret: string | Buffer;
  now?: Date;
  generateId?: () => string;
};

type ResolveRateLimitSecretInput = {
  nodeEnv?: string;
  configuredSecret?: string | Buffer;
  fallbackSecret: string | Buffer;
};

export function resolveRateLimitSecret(input: ResolveRateLimitSecretInput) {
  if (input.configuredSecret) {
    return input.configuredSecret;
  }
  if (input.nodeEnv === "production") {
    throw new Error("RATE_LIMIT_SECRET must be configured in production.");
  }
  return input.fallbackSecret;
}

export function consumeRateLimit(db: DatabaseSync, input: ConsumeRateLimitInput) {
  if (!input.scope || !input.identifier || !Number.isInteger(input.limit) || input.limit < 1 || input.windowMs < 1
    || (input.retentionMs !== undefined && input.retentionMs < input.windowMs)) {
    throw new Error("Invalid rate-limit policy.");
  }

  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const windowStart = new Date(now.getTime() - input.windowMs).toISOString();
  const retentionStart = input.retentionMs === undefined
    ? null
    : new Date(now.getTime() - input.retentionMs).toISOString();
  const keyHash = createHmac("sha256", input.secret).update(input.identifier).digest("hex");

  db.exec("BEGIN IMMEDIATE");
  try {
    if (retentionStart) {
      db.prepare("DELETE FROM rate_limit_events WHERE created_at < ?").run(retentionStart);
    }
    db.prepare(`
      DELETE FROM rate_limit_events
      WHERE scope = ? AND key_hash = ? AND created_at < ?
    `).run(input.scope, keyHash, windowStart);
    const row = db.prepare(`
      SELECT COUNT(*) AS count
      FROM rate_limit_events
      WHERE scope = ? AND key_hash = ? AND created_at >= ?
    `).get(input.scope, keyHash, windowStart) as { count: number };

    if (row.count >= input.limit) {
      db.exec("COMMIT");
      return false;
    }

    db.prepare(`
      INSERT INTO rate_limit_events (id, scope, key_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run((input.generateId ?? randomUUID)(), input.scope, keyHash, nowIso);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
