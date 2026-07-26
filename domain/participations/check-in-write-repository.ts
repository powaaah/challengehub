export type CreateCheckInInput = {
  participationId: string;
  userId: string;
  date: string;
};

export type CreateCheckInResult =
  | "created"
  | "already_exists"
  | "participation_not_found";

export interface CheckInWriteRepository {
  createForUser(input: CreateCheckInInput): CreateCheckInResult;
}