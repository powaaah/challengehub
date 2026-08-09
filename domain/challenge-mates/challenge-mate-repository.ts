import type {
  ChallengeMateDashboard,
  ChallengeMateMode,
  ChallengeMateReportReason
} from "./challenge-mate.ts";

export type SaveChallengeMateProfileInput = {
  userId: string;
  participationId: string;
  goal: string;
  availableFrom: string;
  availableUntil: string;
  mode: ChallengeMateMode;
  location: string | null;
  updatedAt: string;
};

export interface ChallengeMateRepository {
  saveProfile(input: SaveChallengeMateProfileInput):
    | { status: "saved" }
    | { status: "participation_not_available" | "active_match_conflict" };
  deactivateProfile(userId: string, updatedAt: string): { status: "deactivated" | "not_found" };
  getDashboard(userId: string): ChallengeMateDashboard;
  requestMatch(input: {
    id: string;
    requesterUserId: string;
    recipientUserId: string;
    createdAt: string;
  }): { status: "requested" | "not_available" | "already_exists"; connectionId?: string };
  acceptMatch(input: {
    connectionId: string;
    recipientUserId: string;
    acceptedAt: string;
  }): { status: "matched" | "not_available"; connectionId?: string };
  blockUser(input: {
    blockerUserId: string;
    blockedUserId: string;
    createdAt: string;
  }): { status: "blocked" | "invalid_target" };
  reportUser(input: {
    id: string;
    reporterUserId: string;
    reportedUserId: string;
    reason: ChallengeMateReportReason;
    details: string | null;
    createdAt: string;
  }): { status: "reported" | "invalid_target" };
}
