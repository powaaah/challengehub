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

export type RepositoryResult<T> = T | Promise<T>;

export interface ParticipationReadRepository {
  listForUser(userId: string): RepositoryResult<Participation[]>;
  findByIdForUser(participationId: string, userId: string): RepositoryResult<Participation | null>;
  listCheckInDatesForUser(participationId: string, userId: string): RepositoryResult<string[]>;
  listCheckInsForUser(participationId: string, userId: string): RepositoryResult<ChallengeCheckIn[]>;
}
import type { ChallengeDefinition } from "../challenges/challenge-definition.ts";
import type { ChallengeCheckIn } from "../challenges/challenge-outcome.ts";
