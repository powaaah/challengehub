import type { ChallengeParticipationStatsRepository } from "../domain/participations/challenge-participation-stats.ts";
import { SqliteChallengeParticipationStatsRepository } from "../infrastructure/sqlite/sqlite-challenge-participation-stats-repository.ts";
import { rankChallengeParticipants } from "./challenge-progress.ts";
import { getDb } from "./db.ts";

function getChallengeParticipationStatsRepository(): ChallengeParticipationStatsRepository {
  return new SqliteChallengeParticipationStatsRepository(getDb());
}

export async function getParticipationCountByChallengeSlug(slug: string) {
  return await getChallengeParticipationStatsRepository().countByChallengeSlug(slug);
}

export async function getParticipationCountsByChallengeSlug() {
  return await getChallengeParticipationStatsRepository().listCountsByChallengeSlug();
}

export async function getChallengeRankingBySlug(
  slug: string,
  today: string,
  options: { publicOnly?: boolean } = {}
) {
  const candidates = await getChallengeParticipationStatsRepository().listActiveRankingCandidates(slug, options);
  return rankChallengeParticipants(candidates, today);
}

export async function getRecentChallengeActivityBySlug(slug: string, limit = 8) {
  return await getChallengeParticipationStatsRepository().listRecentCheckIns(slug, limit, { publicOnly: true });
}
