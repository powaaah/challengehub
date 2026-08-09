export type Participation = {
  id: string;
  userId: string;
  challengeId: string;
  challengeSlug: string;
  challengeTitle: string;
  challengeGoal: string;
  startedAt: string;
  status: string;
  completedAt: string | null;
  definition: ChallengeDefinition;
};

export interface ParticipationReadRepository {
  listForUser(userId: string): Participation[];
  findByIdForUser(participationId: string, userId: string): Participation | null;
  listCheckInDatesForUser(participationId: string, userId: string): string[];
  listCheckInsForUser(participationId: string, userId: string): ChallengeCheckIn[];
}
import type { ChallengeDefinition } from "../challenges/challenge-definition.ts";
import type { ChallengeCheckIn } from "../challenges/challenge-outcome.ts";
