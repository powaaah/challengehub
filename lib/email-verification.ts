import { createHash } from "node:crypto";
import type {
  CreateEmailVerificationInput,
  CreateEmailVerificationResult,
  VerifyEmailResult
} from "../domain/accounts/email-verification-repository.ts";

const TOKEN_TTL_MS = 30 * 60 * 1000;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type VerificationAccount = {
  id: string;
  email: string;
  emailVerifiedAt: string | null;
};

type RequestEmailVerificationInput = {
  email: string;
  now: Date;
  findAccountByEmail: (email: string) => VerificationAccount | null;
  createToken: (input: CreateEmailVerificationInput) => CreateEmailVerificationResult;
  confirmDelivery: (input: { id: string; userId: string; deliveredAt: string }) => void;
  discardToken: (input: { id: string; userId: string }) => void;
  generateToken: () => string;
  generateId: () => string;
  deliver: (message: { email: string; verificationUrl: string }) => Promise<void>;
  siteUrl: string;
};

export async function requestEmailVerification(input: RequestEmailVerificationInput) {
  const account = input.findAccountByEmail(input.email.trim().toLowerCase());
  if (!account || account.emailVerifiedAt) return { status: "accepted" as const };

  const token = input.generateToken();
  const id = input.generateId();
  const created = input.createToken({
    id,
    userId: account.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(input.now.getTime() + TOKEN_TTL_MS).toISOString()
  });
  if (created.status !== "created") return { status: "accepted" as const };

  try {
    await input.deliver({
      email: account.email,
      verificationUrl: `${input.siteUrl}/auth/email-bestaetigen?token=${encodeURIComponent(token)}`
    });
    input.confirmDelivery({ id, userId: account.id, deliveredAt: input.now.toISOString() });
  } catch {
    input.discardToken({ id, userId: account.id });
  }
  return { status: "accepted" as const };
}

export function verifyEmailToken(input: {
  token: string;
  now: Date;
  verify: (input: { tokenHash: string; now: string }) => VerifyEmailResult;
}) {
  if (!TOKEN_PATTERN.test(input.token)) return { status: "invalid_token" as const };
  return input.verify({ tokenHash: hashToken(input.token), now: input.now.toISOString() });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
