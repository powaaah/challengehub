import { createHash } from "node:crypto";
import type { Account } from "../domain/accounts/account-session-repository.ts";
import type {
  CreatePasswordResetInput,
  CreatePasswordResetResult,
  ResetPasswordInput,
  ResetPasswordResult
} from "../domain/accounts/password-reset-repository.ts";

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const RESET_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

type RequestPasswordResetInput = {
  email: string;
  now: Date;
  findAccountByEmail: (email: string) => Account | null;
  createToken: (input: CreatePasswordResetInput) => CreatePasswordResetResult;
  generateToken: () => string;
  generateId: () => string;
  deliver: (message: { email: string; resetUrl: string }) => Promise<void>;
  siteUrl: string;
};

type ResetPasswordWithTokenInput = {
  token: string;
  password: string;
  now?: Date;
  hashPassword?: (password: string) => string;
  resetPassword: (input: ResetPasswordInput) => ResetPasswordResult;
};

export async function requestPasswordReset(input: RequestPasswordResetInput) {
  const account = input.findAccountByEmail(input.email.trim().toLowerCase());
  if (!account) {
    return { status: "accepted" as const };
  }

  const token = input.generateToken();
  const created = input.createToken({
    id: input.generateId(),
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
  } catch {
    // Die öffentliche Antwort bleibt absichtlich neutral; das Token läuft automatisch ab.
  }

  return { status: "accepted" as const };
}

export function resetPasswordWithToken(input: ResetPasswordWithTokenInput) {
  if (!RESET_TOKEN_PATTERN.test(input.token)) {
    return { status: "invalid_token" as const };
  }
  if (input.password.length < 8) {
    return { status: "invalid_password" as const };
  }
  if (!input.now || !input.hashPassword) {
    return { status: "invalid_token" as const };
  }

  return input.resetPassword({
    tokenHash: hashToken(input.token),
    passwordHash: input.hashPassword(input.password),
    now: input.now.toISOString()
  });
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
