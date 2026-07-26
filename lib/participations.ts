import type { ParticipationReadRepository } from "../domain/participations/participation.ts";
import { SqliteParticipationReadRepository } from "../infrastructure/sqlite/sqlite-participation-read-repository.ts";
import { getDb } from "./db.ts";

function getParticipationReadRepository(): ParticipationReadRepository {
  return new SqliteParticipationReadRepository(getDb());
}

export function getParticipationsForUser(userId: string) {
  return getParticipationReadRepository().listForUser(userId);
}

export function getParticipationByIdForUser(input: { participationId: string; userId: string }) {
  return getParticipationReadRepository().findByIdForUser(input.participationId, input.userId);
}

export function getCheckInDatesForParticipation(input: { participationId: string; userId: string }) {
  return getParticipationReadRepository().listCheckInDatesForUser(input.participationId, input.userId);
}