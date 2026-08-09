import type { DatabaseSync } from "node:sqlite";
import type {
  AccountDataExport,
  AccountDataRepository,
  AccountPrivacyPreferences
} from "../../domain/accounts/account-data-repository.ts";
import { SYSTEM_ACCOUNT_NAME_KEY } from "../../domain/accounts/username.ts";

type PrivacyRow = {
  rankingVisible: number;
  activityVisible: number;
  challengeMateDiscoverable: number;
};

export class SqliteAccountDataRepository implements AccountDataRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  getPrivacyPreferences(userId: string, updatedAt: string): AccountPrivacyPreferences | null {
    this.db.prepare(`
      INSERT OR IGNORE INTO account_privacy_preferences (
        user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
      ) SELECT id, 0, 0, 0, ? FROM users WHERE id = ?
    `).run(updatedAt, userId);
    const row = this.db.prepare(`
      SELECT ranking_visible AS rankingVisible, activity_visible AS activityVisible,
        challenge_mate_discoverable AS challengeMateDiscoverable
      FROM account_privacy_preferences WHERE user_id = ?
    `).get(userId) as PrivacyRow | undefined;
    return row ? mapPrivacy(row) : null;
  }

  updatePrivacyPreferences(input: AccountPrivacyPreferences & { userId: string; updatedAt: string }) {
    const result = this.db.prepare(`
      INSERT INTO account_privacy_preferences (
        user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
      )
      SELECT id, ?, ?, ?, ? FROM users WHERE id = ?
      ON CONFLICT(user_id) DO UPDATE SET
        ranking_visible = excluded.ranking_visible,
        activity_visible = excluded.activity_visible,
        challenge_mate_discoverable = excluded.challenge_mate_discoverable,
        updated_at = excluded.updated_at
    `).run(
      Number(input.rankingVisible), Number(input.activityVisible),
      Number(input.challengeMateDiscoverable), input.updatedAt, input.userId
    );
    if (result.changes === 0) return { status: "not_found" as const };
    this.db.prepare(`
      UPDATE challenge_mate_profiles
      SET active = CASE
        WHEN ? = 1 AND EXISTS (
          SELECT 1 FROM participations
          WHERE participations.id = challenge_mate_profiles.participation_id
            AND participations.user_id = challenge_mate_profiles.user_id
            AND participations.status = 'active'
        ) THEN 1 ELSE 0 END,
        updated_at = ?
      WHERE user_id = ?
    `).run(Number(input.challengeMateDiscoverable), input.updatedAt, input.userId);
    return { status: "updated" as const };
  }

  exportAccountData(userId: string, exportedAt: string): AccountDataExport | null {
    const account = this.db.prepare(`
      SELECT id, email, name, created_at AS createdAt FROM users WHERE id = ?
    `).get(userId) as AccountDataExport["account"] | undefined;
    if (!account || userId === "system") return null;
    const privacy = this.getPrivacyPreferences(userId, exportedAt)!;
    const participations = rows(this.db, `
      SELECT participations.id, challenges.slug AS challengeSlug,
        challenges.title AS challengeTitle, participations.started_at AS startedAt,
        participations.status, participations.completed_at AS completedAt
      FROM participations JOIN challenges ON challenges.id = participations.challenge_id
      WHERE participations.user_id = ? ORDER BY participations.started_at ASC
    `, userId).map((participation) => ({
      ...participation,
      checkIns: rows(this.db, `
        SELECT id, date, value, note, created_at AS createdAt
        FROM check_ins WHERE participation_id = ? ORDER BY date ASC
      `, String(participation.id))
    }));

    return {
      format: "challengehub-account-export-v1",
      exportedAt,
      account,
      privacy,
      sessions: rows(this.db, `
        SELECT id, expires_at AS expiresAt, created_at AS createdAt
        FROM sessions WHERE user_id = ? ORDER BY created_at ASC
      `, userId) as AccountDataExport["sessions"],
      passwordResets: rows(this.db, `
        SELECT id, expires_at AS expiresAt, created_at AS createdAt, used_at AS usedAt
        FROM password_reset_tokens WHERE user_id = ? ORDER BY created_at ASC
      `, userId) as AccountDataExport["passwordResets"],
      createdChallenges: rows(this.db, `
        SELECT id, slug, title, level, category, duration_days AS durationDays, goal,
          description, rules_json AS rules, tips_json AS tips, visibility, status,
          created_at AS createdAt, updated_at AS updatedAt, challenge_type AS challengeType,
          metric_unit AS metricUnit, target_value AS targetValue, frequency,
          measurement_direction AS measurementDirection,
          completion_criterion AS completionCriterion
        FROM challenges WHERE creator_id = ? ORDER BY created_at ASC
      `, userId).map(parseChallengeJson),
      participations,
      createdInvitations: rows(this.db, `
        SELECT invitations.id, participations.id AS participationId,
          invitations.expires_at AS expiresAt, invitations.created_at AS createdAt,
          invitations.accepted_at AS acceptedAt, invitations.revoked_at AS revokedAt
        FROM challenge_invitations invitations
        JOIN participations ON participations.id = invitations.inviter_participation_id
        WHERE participations.user_id = ? ORDER BY invitations.created_at ASC
      `, userId),
      acceptedInvitations: rows(this.db, `
        SELECT id, inviter_participation_id AS inviterParticipationId,
          expires_at AS expiresAt, created_at AS createdAt, accepted_at AS acceptedAt
        FROM challenge_invitations WHERE accepted_by_user_id = ? ORDER BY created_at ASC
      `, userId),
      challengeMate: {
        profile: row(this.db, `
          SELECT participation_id AS participationId, goal,
            available_from AS availableFrom, available_until AS availableUntil,
            mode, location, active, updated_at AS updatedAt
          FROM challenge_mate_profiles WHERE user_id = ?
        `, userId),
        connections: rows(this.db, `
          SELECT id, requester_user_id AS requesterUserId, recipient_user_id AS recipientUserId,
            status, created_at AS createdAt, matched_at AS matchedAt
          FROM challenge_mate_connections
          WHERE requester_user_id = ? OR recipient_user_id = ? ORDER BY created_at ASC
        `, userId, userId),
        blocks: rows(this.db, `
          SELECT blocker_user_id AS blockerUserId, blocked_user_id AS blockedUserId,
            created_at AS createdAt FROM challenge_mate_blocks
          WHERE blocker_user_id = ? OR blocked_user_id = ? ORDER BY created_at ASC
        `, userId, userId),
        submittedReports: rows(this.db, `
          SELECT id, reported_user_id AS reportedUserId, reason, details, status,
            created_at AS createdAt FROM challenge_mate_reports
          WHERE reporter_user_id = ? ORDER BY created_at ASC
        `, userId)
      },
      retention: {
        preferences: rows(this.db, `
          SELECT participation_id AS participationId, in_app_enabled AS inAppEnabled,
            email_reminder_enabled AS emailReminderEnabled,
            weekly_recap_enabled AS weeklyRecapEnabled, updated_at AS updatedAt
          FROM retention_preferences WHERE user_id = ? ORDER BY participation_id ASC
        `, userId),
        notifications: rows(this.db, `
          SELECT id, participation_id AS participationId, type, title, body, href,
            occurred_at AS occurredAt, read_at AS readAt,
            email_delivered_at AS emailDeliveredAt, created_at AS createdAt
          FROM retention_notifications WHERE user_id = ? ORDER BY occurred_at ASC
        `, userId)
      }
    };
  }

  deleteAccountData(input: { userId: string; auditId: string; deletedAt: string }) {
    if (input.userId === "system" || !this.db.prepare("SELECT 1 FROM users WHERE id = ?").get(input.userId)) {
      return { status: "not_found" as const };
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, name_key, password_hash, created_at)
        VALUES ('system', 'system@challengehub.local', 'ChallengeHub', ?, 'disabled:disabled', ?)
      `).run(SYSTEM_ACCOUNT_NAME_KEY, input.deletedAt);
      const published = this.db.prepare(`
        SELECT COUNT(*) AS count FROM challenges WHERE creator_id = ? AND status = 'published'
      `).get(input.userId) as { count: number };
      this.db.prepare(`
        DELETE FROM challenges WHERE creator_id = ? AND status <> 'published'
      `).run(input.userId);
      this.db.prepare(`
        UPDATE challenges SET creator_id = 'system', updated_at = ?
        WHERE creator_id = ? AND status = 'published'
      `).run(input.deletedAt, input.userId);
      this.db.prepare(`
        UPDATE challenge_invitations SET accepted_by_user_id = NULL, accepted_at = NULL
        WHERE accepted_by_user_id = ?
      `).run(input.userId);
      this.db.prepare(`
        INSERT INTO account_deletion_audits (
          id, deleted_at, published_challenges_transferred, retention_basis
        ) VALUES (?, ?, ?, 'operational_deletion_evidence')
      `).run(input.auditId, input.deletedAt, published.count);
      this.db.prepare("DELETE FROM users WHERE id = ?").run(input.userId);
      this.db.exec("COMMIT");
      return { status: "deleted" as const };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}

function mapPrivacy(row: PrivacyRow): AccountPrivacyPreferences {
  return {
    rankingVisible: Boolean(row.rankingVisible),
    activityVisible: Boolean(row.activityVisible),
    challengeMateDiscoverable: Boolean(row.challengeMateDiscoverable)
  };
}

function rows(db: DatabaseSync, sql: string, ...params: Array<string | number>) {
  return db.prepare(sql).all(...params).map((item) => ({ ...item })) as Array<Record<string, unknown>>;
}

function row(db: DatabaseSync, sql: string, ...params: Array<string | number>) {
  const item = db.prepare(sql).get(...params);
  return item ? { ...item } : null;
}

function parseChallengeJson(challenge: Record<string, unknown>) {
  return {
    ...challenge,
    rules: JSON.parse(String(challenge.rules)),
    tips: JSON.parse(String(challenge.tips))
  };
}
