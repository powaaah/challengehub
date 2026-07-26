export type CreateChallengeInvitationInput = {
  id: string;
  inviterParticipationId: string;
  inviterUserId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
};

export type CreateChallengeInvitationResult =
  | { status: "created" }
  | { status: "participation_not_available" | "token_conflict" };

export type ActiveChallengeInvitation = {
  id: string;
  inviterParticipationId: string;
  inviterUserId: string;
  challengeId: string;
  challengeSlug: string;
  expiresAt: string;
};

export type AcceptChallengeInvitationInput = {
  tokenHash: string;
  inviteeUserId: string;
  participationId: string;
  acceptedAt: string;
};

export type AcceptChallengeInvitationResult =
  | { status: "accepted"; participationId: string }
  | { status: "invitation_not_available" | "self_invitation" };

export interface ChallengeInvitationRepository {
  create(input: CreateChallengeInvitationInput): CreateChallengeInvitationResult;
  findActiveByTokenHash(tokenHash: string, now: string): ActiveChallengeInvitation | null;
  accept(input: AcceptChallengeInvitationInput): AcceptChallengeInvitationResult;
}
