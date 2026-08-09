import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import type {
  RetentionDashboard,
  RetentionEmailJob,
  RetentionNotification,
  RetentionPreferences,
  RetentionRepository
} from "../../domain/retention/retention-repository.ts";
import {
  deriveParticipationNotifications,
  type MateRetentionEvent,
  type RetentionNotificationType
} from "../../domain/retention/retention-notification.ts";

type ParticipationRow = {
  id: string;
  challengeSlug: string;
  challengeTitle: string;
  startedAt: string;
  status: string;
  completedAt: string | null;
};

type PreferenceRow = {
  inAppEnabled: number;
  emailReminderEnabled: number;
  weeklyRecapEnabled: number;
};

type NotificationRow = Omit<RetentionNotification, "type"> & { type: string };

export class SqliteRetentionRepository implements RetentionRepository {
  private readonly db: DatabaseSync;
  private readonly generateId: () => string;

  constructor(db: DatabaseSync, generateId: () => string = randomUUID) {
    this.db = db;
    this.generateId = generateId;
  }

  getDashboard(input: {
    userId: string;
    participationId: string;
    today: string;
    now: string;
  }): RetentionDashboard | null {
    const participation = this.getParticipation(input.participationId, input.userId);
    if (!participation) return null;

    this.ensurePreferences(input.userId, input.participationId, input.now);
    this.synchronizeNotifications(participation, input.userId, input.today, input.now);
    const preferences = this.getPreferences(input.participationId, input.userId);
    if (!preferences) return null;

    const rows = this.db.prepare(`
      SELECT id, type, title, body, href, occurred_at AS occurredAt, read_at AS readAt
      FROM retention_notifications
      WHERE user_id = ? AND participation_id = ?
      ORDER BY occurred_at DESC, id DESC
      LIMIT 20
    `).all(input.userId, input.participationId) as unknown as NotificationRow[];

    return {
      preferences,
      notifications: preferences.inAppEnabled ? rows.map(mapNotification) : []
    };
  }

  updatePreferences(input: RetentionPreferences & {
    userId: string;
    participationId: string;
    updatedAt: string;
  }) {
    const result = this.db.prepare(`
      INSERT INTO retention_preferences (
        participation_id, user_id, in_app_enabled, email_reminder_enabled,
        weekly_recap_enabled, updated_at
      )
      SELECT participations.id, participations.user_id, ?, ?, ?, ?
      FROM participations
      WHERE participations.id = ? AND participations.user_id = ?
      ON CONFLICT(participation_id) DO UPDATE SET
        in_app_enabled = excluded.in_app_enabled,
        email_reminder_enabled = excluded.email_reminder_enabled,
        weekly_recap_enabled = excluded.weekly_recap_enabled,
        updated_at = excluded.updated_at
      WHERE retention_preferences.user_id = excluded.user_id
    `).run(
      Number(input.inAppEnabled), Number(input.emailReminderEnabled), Number(input.weeklyRecapEnabled),
      input.updatedAt, input.participationId, input.userId
    );
    return { status: result.changes > 0 ? "updated" as const : "not_found" as const };
  }

  markRead(input: { notificationId: string; userId: string; readAt: string }) {
    const result = this.db.prepare(`
      UPDATE retention_notifications SET read_at = COALESCE(read_at, ?)
      WHERE id = ? AND user_id = ?
    `).run(input.readAt, input.notificationId, input.userId);
    return { status: result.changes > 0 ? "updated" as const : "not_found" as const };
  }

  disableEmail(input: { userId: string; participationId: string; updatedAt: string }) {
    const result = this.db.prepare(`
      UPDATE retention_preferences
      SET email_reminder_enabled = 0, weekly_recap_enabled = 0, updated_at = ?
      WHERE user_id = ? AND participation_id = ?
    `).run(input.updatedAt, input.userId, input.participationId);
    return { status: result.changes > 0 ? "updated" as const : "not_found" as const };
  }

  listDueEmailJobs(input: { today: string; now: string; limit: number }): RetentionEmailJob[] {
    const limit = Math.max(1, Math.min(100, Math.trunc(input.limit)));
    const preferences = this.db.prepare(`
      SELECT user_id AS userId, participation_id AS participationId
      FROM retention_preferences
      WHERE email_reminder_enabled = 1 OR weekly_recap_enabled = 1
      ORDER BY participation_id ASC
      LIMIT 500
    `).all() as unknown as Array<{ userId: string; participationId: string }>;
    for (const preference of preferences) {
      const participation = this.getParticipation(preference.participationId, preference.userId);
      if (participation) {
        this.synchronizeNotifications(participation, preference.userId, input.today, input.now);
      }
    }
    const rows = this.db.prepare(`
      SELECT
        notifications.id, notifications.type, notifications.title, notifications.body,
        notifications.href, notifications.occurred_at AS occurredAt,
        notifications.read_at AS readAt, notifications.participation_id AS participationId,
        notifications.user_id AS userId, users.email
      FROM retention_notifications notifications
      JOIN retention_preferences preferences
        ON preferences.participation_id = notifications.participation_id
        AND preferences.user_id = notifications.user_id
      JOIN users ON users.id = notifications.user_id
      WHERE notifications.email_delivered_at IS NULL
        AND (
          (notifications.type = 'weekly_recap' AND preferences.weekly_recap_enabled = 1)
          OR (
            notifications.type IN ('daily_reminder', 'reactivation', 'completion_badge')
            AND preferences.email_reminder_enabled = 1
          )
        )
      ORDER BY notifications.occurred_at DESC, notifications.id DESC
      LIMIT ?
    `).all(limit) as unknown as Array<RetentionEmailJob & { type: string }>;
    return rows.map((row) => ({ ...row, type: row.type as RetentionNotificationType }));
  }

  markEmailDelivered(input: { notificationId: string; deliveredAt: string }) {
    this.db.prepare(`
      UPDATE retention_notifications
      SET email_delivered_at = COALESCE(email_delivered_at, ?)
      WHERE id = ?
    `).run(input.deliveredAt, input.notificationId);
  }

  private getParticipation(participationId: string, userId: string) {
    return this.db.prepare(`
      SELECT
        participations.id, participations.started_at AS startedAt,
        participations.status, participations.completed_at AS completedAt,
        challenges.slug AS challengeSlug, challenges.title AS challengeTitle
      FROM participations
      JOIN challenges ON challenges.id = participations.challenge_id
      WHERE participations.id = ? AND participations.user_id = ?
    `).get(participationId, userId) as ParticipationRow | undefined;
  }

  private ensurePreferences(userId: string, participationId: string, now: string) {
    this.db.prepare(`
      INSERT OR IGNORE INTO retention_preferences (
        participation_id, user_id, in_app_enabled, email_reminder_enabled,
        weekly_recap_enabled, updated_at
      ) VALUES (?, ?, 1, 0, 0, ?)
    `).run(participationId, userId, now);
  }

  private getPreferences(participationId: string, userId: string): RetentionPreferences | null {
    const row = this.db.prepare(`
      SELECT in_app_enabled AS inAppEnabled,
        email_reminder_enabled AS emailReminderEnabled,
        weekly_recap_enabled AS weeklyRecapEnabled
      FROM retention_preferences
      WHERE participation_id = ? AND user_id = ?
    `).get(participationId, userId) as PreferenceRow | undefined;
    return row ? {
      inAppEnabled: Boolean(row.inAppEnabled),
      emailReminderEnabled: Boolean(row.emailReminderEnabled),
      weeklyRecapEnabled: Boolean(row.weeklyRecapEnabled)
    } : null;
  }

  private synchronizeNotifications(
    participation: ParticipationRow,
    userId: string,
    today: string,
    now: string
  ) {
    const dates = this.db.prepare(`
      SELECT date FROM check_ins WHERE participation_id = ? ORDER BY date ASC
    `).all(participation.id) as unknown as Array<{ date: string }>;
    const dailySourceKey = `daily:${participation.id}:${today}`;
    const reactivationSourceKey = `reactivation:${participation.id}:${today}`;
    this.db.prepare(`
      DELETE FROM retention_notifications
      WHERE user_id = ? AND participation_id = ?
        AND type IN ('daily_reminder', 'reactivation')
        AND source_key NOT IN (?, ?)
    `).run(userId, participation.id, dailySourceKey, reactivationSourceKey);
    if (participation.status !== "active" || dates.some((row) => row.date === today)) {
      this.db.prepare(`
        DELETE FROM retention_notifications
        WHERE user_id = ? AND participation_id = ? AND source_key IN (?, ?)
      `).run(userId, participation.id, dailySourceKey, reactivationSourceKey);
    }
    const mateEvents = this.listMateEvents(userId, participation.id);
    const drafts = deriveParticipationNotifications({
      participation,
      checkInDates: dates.map((row) => row.date),
      today,
      mateEvents
    });
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO retention_notifications (
        id, user_id, participation_id, source_key, type, title, body, href,
        occurred_at, read_at, email_delivered_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
    `);
    for (const draft of drafts) {
      insert.run(
        this.generateId(), userId, participation.id, draft.sourceKey, draft.type,
        draft.title, draft.body, draft.href, draft.occurredAt, now
      );
    }
  }

  private listMateEvents(userId: string, participationId: string): MateRetentionEvent[] {
    const rows = this.db.prepare(`
      SELECT connections.id, connections.status, connections.created_at AS createdAt,
        connections.matched_at AS matchedAt, users.name AS mateName,
        connections.recipient_user_id AS recipientUserId
      FROM challenge_mate_connections connections
      JOIN challenge_mate_profiles own_profile
        ON own_profile.user_id = ? AND own_profile.participation_id = ?
      JOIN participations own_participation ON own_participation.id = own_profile.participation_id
      JOIN challenge_mate_profiles mate_profile ON mate_profile.user_id = CASE
        WHEN connections.requester_user_id = ? THEN connections.recipient_user_id
        ELSE connections.requester_user_id
      END
      JOIN participations mate_participation
        ON mate_participation.id = mate_profile.participation_id
        AND mate_participation.challenge_id = own_participation.challenge_id
      JOIN users ON users.id = mate_profile.user_id
      WHERE
        (connections.status = 'pending' AND connections.recipient_user_id = ?)
        OR (connections.status = 'matched' AND (
          connections.requester_user_id = ? OR connections.recipient_user_id = ?
        ))
    `).all(userId, participationId, userId, userId, userId, userId) as unknown as Array<{
      id: string;
      status: string;
      createdAt: string;
      matchedAt: string | null;
      mateName: string;
      recipientUserId: string;
    }>;
    return rows.map((row) => ({
      key: `mate:${row.id}:${row.status}`,
      kind: row.status === "matched" ? "matched" : "request",
      mateName: row.mateName,
      occurredAt: row.matchedAt ?? row.createdAt
    }));
  }
}

function mapNotification(row: NotificationRow): RetentionNotification {
  return { ...row, type: row.type as RetentionNotificationType };
}
