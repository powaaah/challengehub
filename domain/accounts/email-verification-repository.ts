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

export type EmailVerificationRepositoryResult<T> = T | Promise<T>;

export interface EmailVerificationRepository {
  createForUser(input: CreateEmailVerificationInput): EmailVerificationRepositoryResult<CreateEmailVerificationResult>;
  confirmDelivery(input: {
    id: string;
    userId: string;
    deliveredAt: string;
  }): EmailVerificationRepositoryResult<void>;
  discard(input: { id: string; userId: string }): EmailVerificationRepositoryResult<void>;
  verifyEmail(input: {
    tokenHash: string;
    now: string;
  }): EmailVerificationRepositoryResult<VerifyEmailResult>;
}
