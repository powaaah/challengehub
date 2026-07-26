export type CreatePasswordResetInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
};

export type CreatePasswordResetResult = {
  status: "created" | "user_not_found" | "token_conflict";
};

export type ResetPasswordInput = {
  tokenHash: string;
  passwordHash: string;
  now: string;
};

export type ResetPasswordResult = {
  status: "reset" | "invalid_token";
};

export interface PasswordResetRepository {
  createForUser(input: CreatePasswordResetInput): CreatePasswordResetResult;
  resetPassword(input: ResetPasswordInput): ResetPasswordResult;
}
