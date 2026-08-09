export type CreateEmailVerificationInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
};

export type CreateEmailVerificationResult = {
  status: "created" | "user_not_found" | "already_verified" | "token_conflict";
};

export type VerifyEmailResult = {
  status: "verified" | "already_verified" | "invalid_token";
};

export interface EmailVerificationRepository {
  createForUser(input: CreateEmailVerificationInput): CreateEmailVerificationResult;
  confirmDelivery(input: { id: string; userId: string; deliveredAt: string }): void;
  discard(input: { id: string; userId: string }): void;
  verifyEmail(input: { tokenHash: string; now: string }): VerifyEmailResult;
}
