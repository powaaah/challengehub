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
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type ParticipationRow = {
  id: string;
  challenge_slug: string;
  challenge_title: string;
  started_at: Date | string;
  status: string;
  completed_at: Date | string | null;
};

type PreferenceRow = {
  in_app_enabled: boolean;
  email_reminder_enabled: boolean;
  weekly_recap_enabled: boolean;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  occurred_at: Date | string;
  read_at: Date | string | null;
};

export class PostgresqlRetentionRepository implements RetentionRepository {
  private readonly client: PostgresTransactionalQueryClient;
  private readonly generateId: () => string;

  constructor(
    client: PostgresTransactionalQueryClient,
    generateId: () => string = randomUUID
  ) {
    this.client = client;
    this.generateId = generateId;
  }

  async getDashboard(input: {
    userId: string;
    participationId: string;
    today: string;
    now: string;
  }): Promise<RetentionDashboard | null> {
    return this.client.transaction(async (transaction) => {
      const participation = await this.getParticipation(transaction, input.participationId, input.userId);
      if (!participation) return null;

      await transaction.query(
        `INSERT INTO retention_preferences (
           participation_id, user_id, in_app_enabled, email_reminder_enabled,
           weekly_recap_enabled, updated_at
         ) VALUES ($1, $2, TRUE, FALSE, FALSE, $3::timestamptz)
         ON CONFLICT (participation_id) DO NOTHING`,
        [input.participationId, input.userId, input.now]
      );
      await this.synchronizeNotifications(transaction, participation, input.userId, input.today, input.now);

      const preferenceResult = await transaction.query(
        `SELECT in_app_enabled, email_reminder_enabled, weekly_recap_enabled
         FROM retention_preferences
         WHERE participation_id = $1 AND user_id = $2`,
        [input.participationId, input.userId]
      );
      const preferenceRow = preferenceResult.rows[0] as PreferenceRow | undefined;
      if (!preferenceRow) return null;
      const preferences = mapPreferences(preferenceRow);
      if (!preferences.inAppEnabled) return { preferences, notifications: [] };

      const notificationResult = await transaction.query(
        `SELECT id, type, title, body, href, occurred_at, read_at
         FROM retention_notifications
         WHERE user_id = $1 AND participation_id = $2
         ORDER BY occurred_at DESC, id DESC
         LIMIT 20`,
        [input.userId, input.participationId]
      );
      return {
        preferences,
        notifications: (notificationResult.rows as NotificationRow[]).map(mapNotification)
      };
    });
  }

  async updatePreferences(input: RetentionPreferences & {
    userId: string;
    participationId: string;
    updatedAt: string;
  }) {
    const result = await this.client.query(
      `INSERT INTO retention_preferences (
         participation_id, user_id, in_app_enabled, email_reminder_enabled,
         weekly_recap_enabled, updated_at
       )
       SELECT participations.id, participations.user_id, $1, $2, $3, $4::timestamptz
       FROM participations
       WHERE participations.id = $5 AND participations.user_id = $6
       ON CONFLICT (participation_id) DO UPDATE SET
         in_app_enabled = EXCLUDED.in_app_enabled,
         email_reminder_enabled = EXCLUDED.email_reminder_enabled,
         weekly_recap_enabled = EXCLUDED.weekly_recap_enabled,
         updated_at = EXCLUDED.updated_at
       WHERE retention_preferences.user_id = EXCLUDED.user_id
       RETURNING participation_id`,
      [
        input.inAppEnabled,
        input.emailReminderEnabled,
        input.weeklyRecapEnabled,
        input.updatedAt,
        input.participationId,
        input.userId
      ]
    );
    return { status: result.rows.length > 0 ? "updated" as const : "not_found" as const };
  }

  async markRead(input: { notificationId: string; userId: string; readAt: string }) {
    const result = await this.client.query(
      `UPDATE retention_notifications
       SET read_at = COALESCE(read_at, $1::timestamptz)
       WHERE id = $2 AND user_id = $3
       RETURNING id`,
      [input.readAt, input.notificationId, input.userId]
    );
    return { status: result.rows.length > 0 ? "updated" as const : "not_found" as const };
  }

  async disableEmail(input: { userId: string; participationId: string; updatedAt: string }) {
    const result = await this.client.query(
      `UPDATE retention_preferences
       SET email_reminder_enabled = FALSE, weekly_recap_enabled = FALSE,
         updated_at = $1::timestamptz
       WHERE user_id = $2 AND participation_id = $3
       RETURNING participation_id`,
      [input.updatedAt, input.userId, input.participationId]
    );
    return { status: result.rows.length > 0 ? "updated" as const : "not_found" as const };
  }

  async listDueEmailJobs(input: { today: string; now: string; limit: number }): Promise<RetentionEmailJob[]> {
    const limit = Math.max(1, Math.min(100, Math.trunc(input.limit)));
    return this.client.transaction(async (transaction) => {
      const preferenceResult = await transaction.query(
        `SELECT user_id, participation_id
         FROM retention_preferences
         WHERE email_reminder_enabled = TRUE OR weekly_recap_enabled = TRUE
         ORDER BY participation_id ASC
         LIMIT 500`
      );
      for (const row of preferenceResult.rows as Array<{ user_id: string; participation_id: string }>) {
        const participation = await this.getParticipation(transaction, row.participation_id, row.user_id);
        if (participation) {
          await this.synchronizeNotifications(transaction, participation, row.user_id, input.today, input.now);
        }
      }

      const jobs = await transaction.query(
        `SELECT notifications.id, notifications.type, notifications.title,
           notifications.body, notifications.href, notifications.occurred_at,
           notifications.read_at, notifications.participation_id,
           notifications.user_id, users.email
         FROM retention_notifications notifications
         JOIN retention_preferences preferences
           ON preferences.participation_id = notifications.participation_id
           AND preferences.user_id = notifications.user_id
         JOIN users ON users.id = notifications.user_id
         WHERE notifications.email_delivered_at IS NULL
           AND (
             (notifications.type = 'weekly_recap' AND preferences.weekly_recap_enabled = TRUE)
             OR (
               notifications.type IN ('daily_reminder', 'reactivation', 'completion_badge')
               AND preferences.email_reminder_enabled = TRUE
             )
           )
         ORDER BY notifications.occurred_at DESC, notifications.id DESC
         LIMIT $1`,
        [limit]
      );
      return (jobs.rows as Array<NotificationRow & {
        participation_id: string;
        user_id: string;
        email: string;
      }>).map((row) => ({
        ...mapNotification(row),
        participationId: row.participation_id,
        userId: row.user_id,
        email: row.email
      }));
    });
  }

  async markEmailDelivered(input: { notificationId: string; deliveredAt: string }) {
    await this.client.query(
      `UPDATE retention_notifications
       SET email_delivered_at = COALESCE(email_delivered_at, $1::timestamptz)
       WHERE id = $2`,
      [input.deliveredAt, input.notificationId]
    );
  }

  private async getParticipation(client: PostgresQueryClient, participationId: string, userId: string) {
    const result = await client.query(
      `SELECT participations.id, participations.started_at, participations.status,
         participations.completed_at, challenges.slug AS challenge_slug,
         challenges.title AS challenge_title
       FROM participations
       JOIN challenges ON challenges.id = participations.challenge_id
       WHERE participations.id = $1 AND participations.user_id = $2`,
      [participationId, userId]
    );
    const row = result.rows[0] as ParticipationRow | undefined;
    return row ? {
      id: row.id,
      challengeSlug: row.challenge_slug,
      challengeTitle: row.challenge_title,
      startedAt: toIso(row.started_at),
      status: row.status,
      completedAt: row.completed_at ? toIso(row.completed_at) : null
    } : null;
  }

  private async synchronizeNotifications(
    client: PostgresQueryClient,
    participation: {
      id: string;
      challengeSlug: string;
      challengeTitle: string;
      startedAt: string;
      status: string;
      completedAt: string | null;
    },
    userId: string,
    today: string,
    now: string
  ) {
    const checkInResult = await client.query(
      `SELECT date FROM check_ins WHERE participation_id = $1 ORDER BY date ASC`,
      [participation.id]
    );
    const checkInDates = (checkInResult.rows as Array<{ date: Date | string }>).map((row) => toDateKey(row.date));
    const dailySourceKey = `daily:${participation.id}:${today}`;
    const reactivationSourceKey = `reactivation:${participation.id}:${today}`;
    await client.query(
      `DELETE FROM retention_notifications
       WHERE user_id = $1 AND participation_id = $2
         AND type IN ('daily_reminder', 'reactivation')
         AND source_key NOT IN ($3, $4)`,
      [userId, participation.id, dailySourceKey, reactivationSourceKey]
    );
    if (participation.status !== "active" || checkInDates.includes(today)) {
      await client.query(
        `DELETE FROM retention_notifications
         WHERE user_id = $1 AND participation_id = $2
           AND source_key IN ($3, $4)`,
        [userId, participation.id, dailySourceKey, reactivationSourceKey]
      );
    }

    const mateEvents = await this.listMateEvents(client, userId, participation.id);
    const drafts = deriveParticipationNotifications({ participation, checkInDates, today, mateEvents });
    for (const draft of drafts) {
      await client.query(
        `INSERT INTO retention_notifications (
           id, user_id, participation_id, source_key, type, title, body, href,
           occurred_at, read_at, email_delivered_at, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::timestamptz, NULL, NULL, $10::timestamptz)
         ON CONFLICT (user_id, source_key) DO NOTHING`,
        [
          this.generateId(), userId, participation.id, draft.sourceKey, draft.type,
          draft.title, draft.body, draft.href, draft.occurredAt, now
        ]
      );
    }
  }

  private async listMateEvents(client: PostgresQueryClient, userId: string, participationId: string) {
    const result = await client.query(
      `SELECT connections.id, connections.status, connections.created_at,
         connections.matched_at, users.name AS mate_name
       FROM challenge_mate_connections connections
       JOIN challenge_mate_profiles own_profile
         ON own_profile.user_id = $1 AND own_profile.participation_id = $2
       JOIN participations own_participation ON own_participation.id = own_profile.participation_id
       JOIN challenge_mate_profiles mate_profile ON mate_profile.user_id = CASE
         WHEN connections.requester_user_id = $1 THEN connections.recipient_user_id
         ELSE connections.requester_user_id
       END
       JOIN participations mate_participation
         ON mate_participation.id = mate_profile.participation_id
         AND mate_participation.challenge_id = own_participation.challenge_id
       JOIN users ON users.id = mate_profile.user_id
       WHERE (connections.status = 'pending' AND connections.recipient_user_id = $1)
         OR (connections.status = 'matched' AND (
           connections.requester_user_id = $1 OR connections.recipient_user_id = $1
         ))`,
      [userId, participationId]
    );
    return (result.rows as Array<{
      id: string;
      status: string;
      created_at: Date | string;
      matched_at: Date | string | null;
      mate_name: string;
    }>).map((row): MateRetentionEvent => ({
      key: `mate:${row.id}:${row.status}`,
      kind: row.status === "matched" ? "matched" : "request",
      mateName: row.mate_name,
      occurredAt: toIso(row.matched_at ?? row.created_at)
    }));
  }
}

function mapPreferences(row: PreferenceRow): RetentionPreferences {
  return {
    inAppEnabled: row.in_app_enabled,
    emailReminderEnabled: row.email_reminder_enabled,
    weeklyRecapEnabled: row.weekly_recap_enabled
  };
}

function mapNotification(row: NotificationRow): RetentionNotification {
  return {
    id: row.id,
    type: row.type as RetentionNotificationType,
    title: row.title,
    body: row.body,
    href: row.href,
    occurredAt: toIso(row.occurred_at),
    readAt: row.read_at ? toIso(row.read_at) : null
  };
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function toDateKey(value: Date | string) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}
