import { createHash } from "node:crypto";
import type { Account } from "../domain/accounts/account-session-repository.ts";
import type {
  CreatePasswordResetInput,
  CreatePasswordResetResult,
  PasswordResetRepositoryResult,
  ResetPasswordInput,
  ResetPasswordResult
} from "../domain/accounts/password-reset-repository.ts";
import { isPasswordWithinLimits } from "../domain/security/input-limits.ts";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type RequestPasswordResetInput = {
  email: string;
  now: Date;
  findAccountByEmail: (email: string) => PasswordResetRepositoryResult<Account | null>;
  createToken: (input: CreatePasswordResetInput) => PasswordResetRepositoryResult<CreatePasswordResetResult>;
  confirmDelivery: (input: { id: string; userId: string; deliveredAt: string }) => PasswordResetRepositoryResult<void>;
  discardToken: (input: { id: string; userId: string }) => PasswordResetRepositoryResult<void>;
  generateToken: () => string;
  generateId: () => string;
  deliver: (message: { email: string; resetUrl: string }) => Promise<void>;
  siteUrl: string;
};

type ResetPasswordWithTokenInput = {
  token: string;
  password: string;
  now?: Date;
  isTokenActive?: (input: { tokenHash: string; now: string }) => PasswordResetRepositoryResult<boolean>;
  hashPassword?: (password: string) => string;
  resetPassword: (input: ResetPasswordInput) => PasswordResetRepositoryResult<ResetPasswordResult>;
};

export async function requestPasswordReset(input: RequestPasswordResetInput) {
  const account = await input.findAccountByEmail(input.email.trim().toLowerCase());
  if (!account) {
    return { status: "accepted" as const };
  }

  const token = input.generateToken();
  const id = input.generateId();
  const created = await input.createToken({
    id,
    userId: account.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(input.now.getTime() + RESET_TOKEN_TTL_MS).toISOString()
  });

  if (created.status !== "created") {
    return { status: "accepted" as const };
  }

  try {
    await input.deliver({
      email: account.email,
      resetUrl: `${input.siteUrl}/auth/passwort-zuruecksetzen?token=${encodeURIComponent(token)}`
    });
    await input.confirmDelivery({ id, userId: account.id, deliveredAt: input.now.toISOString() });
  } catch {
    await input.discardToken({ id, userId: account.id });
  }

  return { status: "accepted" as const };
}

export async function resetPasswordWithToken(input: ResetPasswordWithTokenInput) {
  if (!RESET_TOKEN_PATTERN.test(input.token)) {
    return { status: "invalid_token" as const };
  }
  if (!isPasswordWithinLimits(input.password)) {
    return { status: "invalid_password" as const };
  }
  if (!input.now || !input.isTokenActive || !input.hashPassword) {
    return { status: "invalid_token" as const };
  }

  const tokenHash = hashToken(input.token);
  const now = input.now.toISOString();
  if (!await input.isTokenActive({ tokenHash, now })) {
    return { status: "invalid_token" as const };
  }

  return await input.resetPassword({
    tokenHash,
    passwordHash: input.hashPassword(input.password),
    now
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
