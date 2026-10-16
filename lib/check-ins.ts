import type {
  CheckInWriteRepository,
  CreateCheckInInput
} from "../domain/participations/check-in-write-repository.ts";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";
import { getDb } from "./db.ts";
import { recordCompletionTime } from "../infrastructure/sqlite/sqlite-completion-times.ts";

export function saveCompletionTime(input: { participationId: string; userId: string; seconds: number }) {
  return recordCompletionTime(getDb(), input);
}

function getCheckInWriteRepository(): CheckInWriteRepository {
  return new SqliteCheckInWriteRepository(getDb());
}

export function createCheckInForUser(input: CreateCheckInInput) {
  return getCheckInWriteRepository().createForUser(input);
}
