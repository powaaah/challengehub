export type ChallengeRankingCandidate = {
  id: string;
  name: string;
  startedAt: string;
  checkIns: ChallengeCheckIn[];
  definition: ChallengeDefinition;
};

export type ChallengeActivityEntry = {
  id: string;
  participantName: string;
  checkInDate: string;
  createdAt: string;
  value: number | null;
};

type RepositoryResult<T> = T | Promise<T>;

export interface ChallengeParticipationStatsRepository {
  countByChallengeSlug(slug: string): RepositoryResult<number>;
  listCountsByChallengeSlug(): RepositoryResult<Record<string, number>>;
  listActiveRankingCandidates(slug: string, options?: { publicOnly?: boolean }): RepositoryResult<ChallengeRankingCandidate[]>;
  listRecentCheckIns(slug: string, limit: number, options?: { publicOnly?: boolean }): RepositoryResult<ChallengeActivityEntry[]>;
}
import type { ChallengeDefinition } from "../challenges/challenge-definition.ts";
import type { ChallengeCheckIn } from "../challenges/challenge-outcome.ts";
