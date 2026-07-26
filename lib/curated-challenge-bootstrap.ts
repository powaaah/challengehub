import { getChallengeBySlug } from "../data/challenges.ts";
import type { CuratedChallengeBootstrapRepository } from "../domain/challenges/curated-challenge-bootstrap-repository.ts";
import { SqliteCuratedChallengeBootstrapRepository } from "../infrastructure/sqlite/sqlite-curated-challenge-bootstrap-repository.ts";
import { getDb } from "./db.ts";

function getCuratedChallengeBootstrapRepository(): CuratedChallengeBootstrapRepository {
  return new SqliteCuratedChallengeBootstrapRepository(getDb());
}

export function ensureParticipationChallengeRow(slug: string) {
  const challenge = getChallengeBySlug(slug);
  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  return getCuratedChallengeBootstrapRepository().ensureChallenge({
    id: `curated:${challenge.slug}`,
    slug: challenge.slug,
    title: challenge.title,
    level: challenge.level,
    goal: challenge.goal,
    description: challenge.description,
    rules: challenge.rules,
    tips: challenge.tips
  });
}