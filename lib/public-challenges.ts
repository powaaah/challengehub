import type { PublicChallengeRepository } from "../domain/challenges/public-challenge.ts";
import { SqlitePublicChallengeRepository } from "../infrastructure/sqlite/sqlite-public-challenge-repository.ts";
import { getDb } from "./db.ts";

function getPublicChallengeRepository(): PublicChallengeRepository {
  return new SqlitePublicChallengeRepository(getDb());
}

export async function getPublishedChallenges() {
  return getPublicChallengeRepository().listPublished();
}

export async function getPublishedChallengeBySlug(slug: string) {
  return getPublicChallengeRepository().findPublishedBySlug(slug);
}
