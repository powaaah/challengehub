export type StartParticipationInput = {
  userId: string;
  challengeId: string;
};

export type StartParticipationResult =
  | {
      status: "created" | "already_exists";
      participationId: string;
    }
  | {
      status: "challenge_not_available";
    };

export type LeaveParticipationInput = {
  userId: string;
  participationId: string;
};

export type LeaveParticipationResult = {
  status: "left" | "already_inactive" | "not_found";
};

export interface ParticipationWriteRepository {
  startForUser(input: StartParticipationInput): StartParticipationResult;
  leaveForUser(input: LeaveParticipationInput): LeaveParticipationResult;
}