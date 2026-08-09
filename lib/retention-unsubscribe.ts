import { createHmac, timingSafeEqual } from "node:crypto";

type RetentionUnsubscribeTarget = {
  userId: string;
  participationId: string;
};

export function createRetentionUnsubscribeToken(
  target: RetentionUnsubscribeTarget,
  secret = getRetentionTokenSecret()
) {
  const payload = Buffer.from(JSON.stringify(target), "utf8").toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyRetentionUnsubscribeToken(
  token: string,
  secret = getRetentionTokenSecret()
): RetentionUnsubscribeTarget | null {
  const [payload, suppliedSignature, ...rest] = token.split(".");
  if (!payload || !suppliedSignature || rest.length > 0 || token.length > 1000) return null;

  const expectedSignature = sign(payload, secret);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<RetentionUnsubscribeTarget>;
    if (
      typeof parsed.userId !== "string" || !parsed.userId || parsed.userId.length > 100 ||
      typeof parsed.participationId !== "string" || !parsed.participationId || parsed.participationId.length > 100
    ) return null;
    return { userId: parsed.userId, participationId: parsed.participationId };
  } catch {
    return null;
  }
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function getRetentionTokenSecret() {
  const secret = process.env.RETENTION_TOKEN_SECRET ?? process.env.RATE_LIMIT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("RETENTION_TOKEN_SECRET or RATE_LIMIT_SECRET must be configured in production.");
  }
  return "challengehub-local-retention-token-secret";
}
