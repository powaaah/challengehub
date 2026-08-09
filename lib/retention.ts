import type { RetentionPreferences } from "../domain/retention/retention-repository.ts";
import { SqliteRetentionRepository } from "../infrastructure/sqlite/sqlite-retention-repository.ts";
import { getDb } from "./db.ts";

function getRetentionRepository() {
  return new SqliteRetentionRepository(getDb());
}

export function getRetentionDashboard(input: {
  userId: string;
  participationId: string;
  today: string;
  now?: string;
}) {
  return getRetentionRepository().getDashboard({
    ...input,
    now: input.now ?? new Date().toISOString()
  });
}

export function updateRetentionPreferences(input: RetentionPreferences & {
  userId: string;
  participationId: string;
  updatedAt?: string;
}) {
  return getRetentionRepository().updatePreferences({
    ...input,
    updatedAt: input.updatedAt ?? new Date().toISOString()
  });
}

export function markRetentionNotificationRead(input: {
  notificationId: string;
  userId: string;
  readAt?: string;
}) {
  return getRetentionRepository().markRead({
    ...input,
    readAt: input.readAt ?? new Date().toISOString()
  });
}

export function disableRetentionEmail(input: {
  userId: string;
  participationId: string;
  updatedAt?: string;
}) {
  return getRetentionRepository().disableEmail({
    ...input,
    updatedAt: input.updatedAt ?? new Date().toISOString()
  });
}

export function getDueRetentionEmailJobs(
  limit = 50,
  today = getTodayKey(),
  now = new Date().toISOString()
) {
  return getRetentionRepository().listDueEmailJobs({ limit, today, now });
}

export function markRetentionEmailDelivered(notificationId: string, deliveredAt = new Date().toISOString()) {
  getRetentionRepository().markEmailDelivered({ notificationId, deliveredAt });
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}
