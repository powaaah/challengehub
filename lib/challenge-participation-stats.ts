import type { ChallengeParticipationStatsRepository } from "../domain/participations/challenge-participation-stats.ts";
import { SqliteChallengeParticipationStatsRepository } from "../infrastructure/sqlite/sqlite-challenge-participation-stats-repository.ts";
import { rankChallengeParticipants } from "./challenge-progress.ts";
import { getDb } from "./db.ts";

function getChallengeParticipationStatsRepository(): ChallengeParticipationStatsRepository {
  return new SqliteChallengeParticipationStatsRepository(getDb());
}

export function getParticipationCountByChallengeSlug(slug: string) {
  return getChallengeParticipationStatsRepository().countByChallengeSlug(slug);
}

export function getParticipationCountsByChallengeSlug() {
  return getChallengeParticipationStatsRepository().listCountsByChallengeSlug();
}

export function getChallengeRankingBySlug(slug: string, today: string) {
  const candidates = getChallengeParticipationStatsRepository().listActiveRankingCandidates(slug);
  return rankChallengeParticipants(candidates, today);
}

export function getRecentChallengeActivityBySlug(slug: string, limit = 8) {
  return getChallengeParticipationStatsRepository().listRecentCheckIns(slug, limit);
}