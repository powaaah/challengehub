import type {
  AccountDataExport,
  AccountDataRepository,
  AccountPrivacyPreferences
} from "../../domain/accounts/account-data-repository.ts";
import { SYSTEM_ACCOUNT_NAME_KEY } from "../../domain/accounts/username.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type PrivacyRow = {
  ranking_visible: unknown;
  activity_visible: unknown;
  challenge_mate_discoverable: unknown;
};

export class PostgresqlAccountDataRepository implements AccountDataRepository {
  private readonly client: PostgresTransactionalQueryClient;

  constructor(client: PostgresTransactionalQueryClient) {
    this.client = client;
  }

  async getPrivacyPreferences(
    userId: string,
    updatedAt: string
  ): Promise<AccountPrivacyPreferences | null> {
    return this.client.transaction(async (client) => {
      await ensurePrivacyPreferences(client, userId, updatedAt);
      return readPrivacyPreferences(client, userId);
    });
  }

  async updatePrivacyPreferences(
    input: AccountPrivacyPreferences & { userId: string; updatedAt: string }
  ): Promise<{ status: "updated" | "not_found" }> {
    return this.client.transaction(async (client) => {
      const result = await client.query(
        `INSERT INTO account_privacy_preferences (
           user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
         )
         SELECT id, $1, $2, $3, $4::timestamptz
         FROM users
         WHERE id = $5
         ON CONFLICT (user_id) DO UPDATE SET
           ranking_visible = EXCLUDED.ranking_visible,
           activity_visible = EXCLUDED.activity_visible,
           challenge_mate_discoverable = EXCLUDED.challenge_mate_discoverable,
           updated_at = EXCLUDED.updated_at
         RETURNING user_id`,
        [input.rankingVisible, input.activityVisible, input.challengeMateDiscoverable,
          input.updatedAt, input.userId]
      );
      if (result.rows.length === 0) return { status: "not_found" };

      await client.query(
        `UPDATE challenge_mate_profiles
         SET active = $1 AND EXISTS (
           SELECT 1 FROM participations
           WHERE participations.id = challenge_mate_profiles.participation_id
             AND participations.user_id = challenge_mate_profiles.user_id
             AND participations.status = 'active'
         ), updated_at = $2::timestamptz
         WHERE user_id = $3`,
        [input.challengeMateDiscoverable, input.updatedAt, input.userId]
      );
      return { status: "updated" };
    });
  }

  async exportAccountData(userId: string, exportedAt: string): Promise<AccountDataExport | null> {
    return this.client.transaction(async (client) => {
      const accountResult = await client.query(
        `SELECT id, email, name, created_at AS "createdAt",
           email_verified_at AS "emailVerifiedAt"
         FROM users WHERE id = $1`,
        [userId]
      );
      if (accountResult.rows.length === 0 || userId === "system") return null;

      await ensurePrivacyPreferences(client, userId, exportedAt);
      const privacy = await readPrivacyPreferences(client, userId);
      if (!privacy) return null;

      const participations = await queryRecords(client,
        `SELECT participations.id, challenges.slug AS "challengeSlug",
           challenges.title AS "challengeTitle", participations.started_at AS "startedAt",
           participations.status, participations.completed_at AS "completedAt"
         FROM participations
         JOIN challenges ON challenges.id = participations.challenge_id
         WHERE participations.user_id = $1 ORDER BY participations.started_at ASC`, [userId]);
      const participationsWithCheckIns = await Promise.all(participations.map(async (participation) => ({
        ...participation,
        checkIns: await queryRecords(client,
          `SELECT id, date, value, note, created_at AS "createdAt"
           FROM check_ins WHERE participation_id = $1 ORDER BY date ASC`, [participation.id])
      })));

      const [sessions, passwordResets, emailVerifications, createdChallenges,
        createdInvitations, acceptedInvitations, mateProfile, mateConnections,
        mateBlocks, submittedReports, retentionPreferences, retentionNotifications] = await Promise.all([
        queryRecords(client,
          `SELECT id, expires_at AS "expiresAt", created_at AS "createdAt"
           FROM sessions WHERE user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT id, expires_at AS "expiresAt", created_at AS "createdAt", used_at AS "usedAt"
           FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT id, expires_at AS "expiresAt", created_at AS "createdAt", used_at AS "usedAt"
           FROM email_verification_tokens WHERE user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT id, slug, title, level, category, duration_days AS "durationDays", goal,
             description, rules_json AS rules, tips_json AS tips, visibility, status,
             created_at AS "createdAt", updated_at AS "updatedAt",
             challenge_type AS "challengeType", metric_unit AS "metricUnit",
             target_value AS "targetValue", frequency,
             measurement_direction AS "measurementDirection",
             completion_criterion AS "completionCriterion"
           FROM challenges WHERE creator_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT invitations.id, participations.id AS "participationId",
             invitations.expires_at AS "expiresAt", invitations.created_at AS "createdAt",
             invitations.accepted_at AS "acceptedAt", invitations.revoked_at AS "revokedAt"
           FROM challenge_invitations invitations
           JOIN participations ON participations.id = invitations.inviter_participation_id
           WHERE participations.user_id = $1 ORDER BY invitations.created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT id, inviter_participation_id AS "inviterParticipationId",
             expires_at AS "expiresAt", created_at AS "createdAt", accepted_at AS "acceptedAt"
           FROM challenge_invitations WHERE accepted_by_user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT participation_id AS "participationId", goal,
             available_from AS "availableFrom", available_until AS "availableUntil",
             mode, location, active, updated_at AS "updatedAt"
           FROM challenge_mate_profiles WHERE user_id = $1`, [userId]),
        queryRecords(client,
          `SELECT id, requester_user_id AS "requesterUserId", recipient_user_id AS "recipientUserId",
             status, created_at AS "createdAt", matched_at AS "matchedAt"
           FROM challenge_mate_connections
           WHERE requester_user_id = $1 OR recipient_user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT blocker_user_id AS "blockerUserId", blocked_user_id AS "blockedUserId",
             created_at AS "createdAt" FROM challenge_mate_blocks
           WHERE blocker_user_id = $1 OR blocked_user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT id, reported_user_id AS "reportedUserId", reason, details, status,
             created_at AS "createdAt" FROM challenge_mate_reports
           WHERE reporter_user_id = $1 ORDER BY created_at ASC`, [userId]),
        queryRecords(client,
          `SELECT participation_id AS "participationId", in_app_enabled AS "inAppEnabled",
             email_reminder_enabled AS "emailReminderEnabled",
             weekly_recap_enabled AS "weeklyRecapEnabled", updated_at AS "updatedAt"
           FROM retention_preferences WHERE user_id = $1 ORDER BY participation_id ASC`, [userId]),
        queryRecords(client,
          `SELECT id, participation_id AS "participationId", type, title, body, href,
             occurred_at AS "occurredAt", read_at AS "readAt",
             email_delivered_at AS "emailDeliveredAt", created_at AS "createdAt"
           FROM retention_notifications WHERE user_id = $1 ORDER BY occurred_at ASC`, [userId])
      ]);

      return {
        format: "challengehub-account-export-v1",
        exportedAt,
        account: normalizeRecord(accountResult.rows[0]) as AccountDataExport["account"],
        privacy,
        sessions: sessions as AccountDataExport["sessions"],
        passwordResets: passwordResets as AccountDataExport["passwordResets"],
        emailVerifications: emailVerifications as AccountDataExport["emailVerifications"],
        createdChallenges,
        participations: participationsWithCheckIns,
        createdInvitations,
        acceptedInvitations,
        challengeMate: {
          profile: mateProfile[0] ?? null,
          connections: mateConnections,
          blocks: mateBlocks,
          submittedReports
        },
        retention: { preferences: retentionPreferences, notifications: retentionNotifications }
      };
    });
  }

  async deleteAccountData(input: {
    userId: string;
    auditId: string;
    deletedAt: string;
  }): Promise<{ status: "deleted" | "not_found" }> {
    if (input.userId === "system") return { status: "not_found" };

    return this.client.transaction(async (client) => {
      const account = await client.query(`SELECT id FROM users WHERE id = $1 FOR UPDATE`, [input.userId]);
      if (account.rows.length === 0) return { status: "not_found" };

      await client.query(
        `INSERT INTO users (id, email, name, name_key, password_hash, created_at, email_verified_at)
         VALUES ('system', 'system@challengehub.local', 'ChallengeHub', $1,
           'disabled:disabled', $2::timestamptz, $2::timestamptz)
         ON CONFLICT DO NOTHING`,
        [SYSTEM_ACCOUNT_NAME_KEY, input.deletedAt]
      );
      const publishedResult = await client.query(
        `SELECT COUNT(*)::integer AS count FROM challenges
         WHERE creator_id = $1 AND status = 'published'`, [input.userId]);
      const publishedCount = Number((publishedResult.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
      await client.query(`DELETE FROM challenges WHERE creator_id = $1 AND status <> 'published'`, [input.userId]);
      await client.query(
        `UPDATE challenges SET creator_id = 'system', updated_at = $1::timestamptz
         WHERE creator_id = $2 AND status = 'published'`, [input.deletedAt, input.userId]);
      await client.query(
        `UPDATE challenge_invitations SET accepted_by_user_id = NULL, accepted_at = NULL
         WHERE accepted_by_user_id = $1`, [input.userId]);
      await client.query(
        `INSERT INTO account_deletion_audits (
           id, deleted_at, published_challenges_transferred, retention_basis
         ) VALUES ($1, $2::timestamptz, $3, 'operational_deletion_evidence')`,
        [input.auditId, input.deletedAt, publishedCount]);
      await client.query(`DELETE FROM users WHERE id = $1`, [input.userId]);
      return { status: "deleted" };
    });
  }
}

async function ensurePrivacyPreferences(client: PostgresQueryClient, userId: string, updatedAt: string) {
  await client.query(
    `INSERT INTO account_privacy_preferences (
       user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
     ) SELECT id, FALSE, FALSE, FALSE, $1::timestamptz FROM users WHERE id = $2
     ON CONFLICT (user_id) DO NOTHING`, [updatedAt, userId]);
}

async function readPrivacyPreferences(
  client: PostgresQueryClient,
  userId: string
): Promise<AccountPrivacyPreferences | null> {
  const result = await client.query(
    `SELECT ranking_visible, activity_visible, challenge_mate_discoverable
     FROM account_privacy_preferences WHERE user_id = $1`, [userId]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as PrivacyRow;
  return {
    rankingVisible: Boolean(row.ranking_visible),
    activityVisible: Boolean(row.activity_visible),
    challengeMateDiscoverable: Boolean(row.challenge_mate_discoverable)
  };
}

async function queryRecords(client: PostgresQueryClient, text: string, values: unknown[]) {
  const result = await client.query(text, values);
  return result.rows.map(normalizeRecord);
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  const record = value as Record<string, unknown>;
  return Object.fromEntries(Object.entries(record).map(([key, item]) => [
    key, item instanceof Date ? item.toISOString() : item
  ]));
}
