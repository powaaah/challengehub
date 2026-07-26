import type {
  ParticipationWriteRepository,
  StartParticipationInput
} from "../domain/participations/participation-write-repository.ts";
import { SqliteParticipationWriteRepository } from "../infrastructure/sqlite/sqlite-participation-write-repository.ts";
import { ensureParticipationChallengeRow } from "./curated-challenge-bootstrap.ts";
import { getDb } from "./db.ts";
import { getPublishedChallengeBySlug } from "./public-challenges.ts";
import { getChallengeBySlug } from "../data/challenges.ts";

function getParticipationWriteRepository(): ParticipationWriteRepository {
  return new SqliteParticipationWriteRepository(getDb());
}

export async function startParticipationForUser(input: {
  userId: string;
  challengeSlug: string;
}) {
  const curatedChallenge = getChallengeBySlug(input.challengeSlug);
  const communityChallenge = curatedChallenge
    ? null
    : await getPublishedChallengeBySlug(input.challengeSlug);
  const challengeId = curatedChallenge
    ? ensureParticipationChallengeRow(input.challengeSlug)
    : communityChallenge?.id;

  if (!challengeId) {
    return { status: "challenge_not_available" as const };
  }

  const repositoryInput: StartParticipationInput = {
    userId: input.userId,
    challengeId
  };

  return getParticipationWriteRepository().startForUser(repositoryInput);
}

export function leaveParticipationForUser(input: {
  userId: string;
  participationId: string;
}) {
  return getParticipationWriteRepository().leaveForUser(input);
}