import type {
  CheckInWriteRepository,
  CreateCheckInInput
} from "../domain/participations/check-in-write-repository.ts";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";
import { getDb } from "./db.ts";
import { recordCompletionTime } from "../infrastructure/sqlite/sqlite-completion-times.ts";
import { getParticipationByIdForUser } from './participations.ts';
import { getJourneyPeriod } from '../domain/challenges/journey-period.ts';

export function saveCompletionTime(input: { participationId: string; userId: string; seconds: number }) {
  return recordCompletionTime(getDb(), input);
}

function getCheckInWriteRepository(): CheckInWriteRepository {
  return new SqliteCheckInWriteRepository(getDb());
}

export function createCheckInForUser(input: CreateCheckInInput) {
  const participation = getParticipationByIdForUser(input);
  if (participation?.challengeSlug === '100-tage-body-transformation') return 'invalid_value' as const;
  if (participation && getJourneyPeriod(participation.challengeSlug, participation.startedAt, input.date).ended) return 'invalid_value' as const;
  return getCheckInWriteRepository().createForUser(input);
}
