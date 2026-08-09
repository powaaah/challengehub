import type { ChallengeMateRepository } from "../domain/challenge-mates/challenge-mate-repository.ts";
import { SqliteChallengeMateRepository } from "../infrastructure/sqlite/sqlite-challenge-mate-repository.ts";
import { getDb } from "./db.ts";

function getChallengeMateRepository(): ChallengeMateRepository {
  return new SqliteChallengeMateRepository(getDb());
}

export function getChallengeMateDashboard(userId: string) {
  return getChallengeMateRepository().getDashboard(userId);
}

export function saveChallengeMateProfile(
  input: Parameters<ChallengeMateRepository["saveProfile"]>[0]
) {
  return getChallengeMateRepository().saveProfile(input);
}

export function deactivateChallengeMateProfile(userId: string, updatedAt: string) {
  return getChallengeMateRepository().deactivateProfile(userId, updatedAt);
}

export function requestChallengeMate(
  input: Parameters<ChallengeMateRepository["requestMatch"]>[0]
) {
  return getChallengeMateRepository().requestMatch(input);
}

export function acceptChallengeMate(
  input: Parameters<ChallengeMateRepository["acceptMatch"]>[0]
) {
  return getChallengeMateRepository().acceptMatch(input);
}

export function blockChallengeMate(
  input: Parameters<ChallengeMateRepository["blockUser"]>[0]
) {
  return getChallengeMateRepository().blockUser(input);
}

export function reportChallengeMate(
  input: Parameters<ChallengeMateRepository["reportUser"]>[0]
) {
  return getChallengeMateRepository().reportUser(input);
}
