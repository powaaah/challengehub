import { createHash } from "node:crypto";
import type {
  CreateEmailVerificationInput,
  CreateEmailVerificationResult,
  EmailVerificationRepositoryResult,
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
  findAccountByEmail: (email: string) => EmailVerificationRepositoryResult<VerificationAccount | null>;
  createToken: (input: CreateEmailVerificationInput) => EmailVerificationRepositoryResult<CreateEmailVerificationResult>;
  confirmDelivery: (input: { id: string; userId: string; deliveredAt: string }) => EmailVerificationRepositoryResult<void>;
  discardToken: (input: { id: string; userId: string }) => EmailVerificationRepositoryResult<void>;
  generateToken: () => string;
  generateId: () => string;
  deliver: (message: { email: string; verificationUrl: string }) => Promise<void>;
  siteUrl: string;
};

export async function requestEmailVerification(input: RequestEmailVerificationInput) {
  const account = await input.findAccountByEmail(input.email.trim().toLowerCase());
  if (!account || account.emailVerifiedAt) return { status: "accepted" as const };

  const token = input.generateToken();
  const id = input.generateId();
  const created = await input.createToken({
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
    await input.confirmDelivery({ id, userId: account.id, deliveredAt: input.now.toISOString() });
  } catch {
    await input.discardToken({ id, userId: account.id });
  }
  return { status: "accepted" as const };
}

export async function verifyEmailToken(input: {
  token: string;
  now: Date;
  verify: (input: { tokenHash: string; now: string }) => EmailVerificationRepositoryResult<VerifyEmailResult>;
}) {
  if (!TOKEN_PATTERN.test(input.token)) return { status: "invalid_token" as const };
  return await input.verify({ tokenHash: hashToken(input.token), now: input.now.toISOString() });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
