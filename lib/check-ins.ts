import type {
  CheckInWriteRepository,
  CreateCheckInInput
} from "../domain/participations/check-in-write-repository.ts";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";
import { getDb } from "./db.ts";

function getCheckInWriteRepository(): CheckInWriteRepository {
  return new SqliteCheckInWriteRepository(getDb());
}

export function createCheckInForUser(input: CreateCheckInInput) {
  return getCheckInWriteRepository().createForUser(input);
}