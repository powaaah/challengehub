export type CreateCheckInInput = {
  participationId: string;
  userId: string;
  date: string;
  value?: number;
};

export type CreateCheckInResult =
  | "created"
  | "already_exists"
  | "invalid_value"
  | "participation_not_found";

export interface CheckInWriteRepository {
  createForUser(input: CreateCheckInInput): CreateCheckInResult;
}
