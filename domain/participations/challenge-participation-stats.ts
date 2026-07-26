export type ChallengeRankingCandidate = {
  id: string;
  name: string;
  startedAt: string;
  checkInDates: string[];
};

export type ChallengeActivityEntry = {
  id: string;
  participantName: string;
  checkInDate: string;
  createdAt: string;
};

export interface ChallengeParticipationStatsRepository {
  countByChallengeSlug(slug: string): number;
  listCountsByChallengeSlug(): Record<string, number>;
  listActiveRankingCandidates(slug: string): ChallengeRankingCandidate[];
  listRecentCheckIns(slug: string, limit: number): ChallengeActivityEntry[];
}