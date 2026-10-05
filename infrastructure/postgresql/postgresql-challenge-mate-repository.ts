import {
  areChallengeMateProfilesCompatible,
  type ChallengeMateConnectionView,
  type ChallengeMateDashboard,
  type ChallengeMateProfile
} from "../../domain/challenge-mates/challenge-mate.ts";
import type {
  ChallengeMateRepository,
  SaveChallengeMateProfileInput
} from "../../domain/challenge-mates/challenge-mate-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type ProfileRow = {
  user_id: string;
  participation_id: string;
  challenge_id: string;
  challenge_slug: string;
  challenge_title: string;
  user_name: string;
  goal: string;
  available_from: Date | string;
  available_until: Date | string;
  mode: "remote" | "local";
  location: string | null;
  active: boolean;
  updated_at: Date | string;
};

type ConnectionRow = {
  id: string;
  requester_user_id: string;
  recipient_user_id: string;
  status: "pending" | "matched";
  created_at: Date | string;
  matched_at: Date | string | null;
};

export class PostgresqlChallengeMateRepository implements ChallengeMateRepository {
  private readonly client: PostgresTransactionalQueryClient;

  constructor(client: PostgresTransactionalQueryClient) {
    this.client = client;
  }

  async saveProfile(input: SaveChallengeMateProfileInput) {
    return this.client.transaction(async (transaction) => {
      await lockUsers(transaction, [input.userId]);
      const existing = await transaction.query(
        `SELECT participation_id
         FROM challenge_mate_profiles
         WHERE user_id = $1
         FOR UPDATE`,
        [input.userId]
      );
      const matched = await transaction.query(
        `SELECT 1
         FROM challenge_mate_connections
         WHERE status = 'matched' AND (requester_user_id = $1 OR recipient_user_id = $1)
         FOR UPDATE`,
        [input.userId]
      );
      const participationId = (existing.rows[0] as { participation_id?: string } | undefined)
        ?.participation_id;
      if (participationId && participationId !== input.participationId && matched.rows.length > 0) {
        return { status: "active_match_conflict" as const };
      }

      const saved = await transaction.query(
        `INSERT INTO challenge_mate_profiles (
           user_id, participation_id, goal, available_from, available_until,
           mode, location, active, updated_at
         )
         SELECT $1, participations.id, $2, $3::date, $4::date, $5, $6, TRUE, $7::timestamptz
         FROM participations
         WHERE participations.id = $8
           AND participations.user_id = $1
           AND participations.status = 'active'
         ON CONFLICT (user_id) DO UPDATE SET
           participation_id = EXCLUDED.participation_id,
           goal = EXCLUDED.goal,
           available_from = EXCLUDED.available_from,
           available_until = EXCLUDED.available_until,
           mode = EXCLUDED.mode,
           location = EXCLUDED.location,
           active = TRUE,
           updated_at = EXCLUDED.updated_at
         RETURNING user_id`,
        [
          input.userId,
          input.goal,
          input.availableFrom,
          input.availableUntil,
          input.mode,
          input.location,
          input.updatedAt,
          input.participationId
        ]
      );
      if (saved.rows.length !== 1) return { status: "participation_not_available" as const };

      await transaction.query(
        `INSERT INTO account_privacy_preferences (
           user_id, ranking_visible, activity_visible, challenge_mate_discoverable, updated_at
         ) VALUES ($1, FALSE, FALSE, TRUE, $2::timestamptz)
         ON CONFLICT (user_id) DO UPDATE SET
           challenge_mate_discoverable = TRUE,
           updated_at = EXCLUDED.updated_at`,
        [input.userId, input.updatedAt]
      );
      return { status: "saved" as const };
    });
  }

  async deactivateProfile(userId: string, updatedAt: string) {
    return this.client.transaction(async (transaction) => {
      await lockUsers(transaction, [userId]);
      const result = await transaction.query(
        `UPDATE challenge_mate_profiles
         SET active = FALSE, updated_at = $2::timestamptz
         WHERE user_id = $1
         RETURNING user_id`,
        [userId, updatedAt]
      );
      await transaction.query(
        `UPDATE account_privacy_preferences
         SET challenge_mate_discoverable = FALSE, updated_at = $2::timestamptz
         WHERE user_id = $1`,
        [userId, updatedAt]
      );
      return result.rows.length === 1
        ? { status: "deactivated" as const }
        : { status: "not_found" as const };
    });
  }

  async getDashboard(userId: string): Promise<ChallengeMateDashboard> {
    const profile = await getProfile(this.client, userId);
    const [blockedResult, connectionResult] = await Promise.all([
      this.client.query(
        `SELECT blocked_user_id AS user_id FROM challenge_mate_blocks WHERE blocker_user_id = $1
         UNION
         SELECT blocker_user_id AS user_id FROM challenge_mate_blocks WHERE blocked_user_id = $1`,
        [userId]
      ),
      this.client.query(
        `SELECT id, requester_user_id, recipient_user_id, status, created_at, matched_at
         FROM challenge_mate_connections
         WHERE (requester_user_id = $1 OR recipient_user_id = $1)
           AND status IN ('pending', 'matched')
         ORDER BY created_at DESC`,
        [userId]
      )
    ]);
    const blockedUsers = new Set(blockedResult.rows.map((row) => (row as { user_id: string }).user_id));
    const connections = connectionResult.rows as ConnectionRow[];
    const connectedUsers = new Set(connections.flatMap((connection) => [
      connection.requester_user_id,
      connection.recipient_user_id
    ]).filter((id) => id !== userId));
    const mateIds = [...connectedUsers];
    const mateProfiles = mateIds.length > 0
      ? await getProfiles(this.client, mateIds, false)
      : [];
    const profilesByUser = new Map(mateProfiles.map((candidate) => [candidate.userId, candidate]));
    const activeProfiles = profile ? await getProfiles(this.client, [userId], true) : [];
    const suggestions = profile
      ? activeProfiles
          .filter((candidate) => candidate.userId !== userId)
          .filter((candidate) => !blockedUsers.has(candidate.userId))
          .filter((candidate) => !connectedUsers.has(candidate.userId))
          .filter((candidate) => areChallengeMateProfilesCompatible(profile, candidate))
      : [];
    const toView = (connection: ConnectionRow) => toConnectionView(
      connection,
      userId,
      profilesByUser
    );

    return {
      profile,
      suggestions,
      incoming: connections
        .filter((connection) => connection.status === "pending" && connection.recipient_user_id === userId)
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null),
      outgoing: connections
        .filter((connection) => connection.status === "pending" && connection.requester_user_id === userId)
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null),
      matches: connections
        .filter((connection) => connection.status === "matched")
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null)
    };
  }

  async requestMatch(input: {
    id: string;
    requesterUserId: string;
    recipientUserId: string;
    createdAt: string;
  }) {
    return this.client.transaction(async (transaction) => {
      if (input.requesterUserId === input.recipientUserId) return { status: "not_available" as const };
      await lockUsers(transaction, [input.requesterUserId, input.recipientUserId]);
      const [requester, recipient] = await Promise.all([
        getProfile(transaction, input.requesterUserId),
        getProfile(transaction, input.recipientUserId)
      ]);
      if (!requester || !recipient || !areChallengeMateProfilesCompatible(requester, recipient)) {
        return { status: "not_available" as const };
      }
      if (await isBlocked(transaction, input.requesterUserId, input.recipientUserId)) {
        return { status: "not_available" as const };
      }
      const [low, high] = [input.requesterUserId, input.recipientUserId].sort();
      const result = await transaction.query(
        `INSERT INTO challenge_mate_connections (
           id, requester_user_id, recipient_user_id, user_low_id, user_high_id,
           status, created_at, matched_at
         ) VALUES ($1, $2, $3, $4, $5, 'pending', $6::timestamptz, NULL)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [input.id, input.requesterUserId, input.recipientUserId, low, high, input.createdAt]
      );
      return result.rows.length === 1
        ? { status: "requested" as const, connectionId: input.id }
        : { status: "already_exists" as const };
    });
  }

  async acceptMatch(input: { connectionId: string; recipientUserId: string; acceptedAt: string }) {
    return this.client.transaction(async (transaction) => {
      const preview = await transaction.query(
        `SELECT requester_user_id, recipient_user_id
         FROM challenge_mate_connections
         WHERE id = $1 AND recipient_user_id = $2 AND status = 'pending'`,
        [input.connectionId, input.recipientUserId]
      );
      const previewConnection = preview.rows[0] as {
        requester_user_id: string;
        recipient_user_id: string;
      } | undefined;
      if (!previewConnection) return { status: "not_available" as const };
      await lockUsers(transaction, [
        previewConnection.requester_user_id,
        previewConnection.recipient_user_id
      ]);
      const selected = await transaction.query(
        `SELECT requester_user_id, recipient_user_id
         FROM challenge_mate_connections
         WHERE id = $1 AND recipient_user_id = $2 AND status = 'pending'
         FOR UPDATE`,
        [input.connectionId, input.recipientUserId]
      );
      const connection = selected.rows[0] as {
        requester_user_id: string;
        recipient_user_id: string;
      } | undefined;
      if (!connection) return { status: "not_available" as const };
      const [requester, recipient] = await Promise.all([
        getProfile(transaction, connection.requester_user_id),
        getProfile(transaction, connection.recipient_user_id)
      ]);
      if (
        !requester || !recipient ||
        !areChallengeMateProfilesCompatible(requester, recipient) ||
        await isBlocked(transaction, connection.requester_user_id, connection.recipient_user_id)
      ) {
        return { status: "not_available" as const };
      }
      const result = await transaction.query(
        `UPDATE challenge_mate_connections
         SET status = 'matched', matched_at = $3::timestamptz
         WHERE id = $1 AND recipient_user_id = $2 AND status = 'pending'
         RETURNING id`,
        [input.connectionId, input.recipientUserId, input.acceptedAt]
      );
      return result.rows.length === 1
        ? { status: "matched" as const, connectionId: input.connectionId }
        : { status: "not_available" as const };
    });
  }

  async blockUser(input: { blockerUserId: string; blockedUserId: string; createdAt: string }) {
    if (input.blockerUserId === input.blockedUserId) return { status: "invalid_target" as const };
    return this.client.transaction(async (transaction) => {
      const users = await lockUsers(transaction, [input.blockerUserId, input.blockedUserId]);
      if (users !== 2) return { status: "invalid_target" as const };
      await transaction.query(
        `INSERT INTO challenge_mate_blocks (blocker_user_id, blocked_user_id, created_at)
         VALUES ($1, $2, $3::timestamptz)
         ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING`,
        [input.blockerUserId, input.blockedUserId, input.createdAt]
      );
      const [low, high] = [input.blockerUserId, input.blockedUserId].sort();
      await transaction.query(
        `UPDATE challenge_mate_connections
         SET status = 'blocked', matched_at = NULL
         WHERE user_low_id = $1 AND user_high_id = $2`,
        [low, high]
      );
      return { status: "blocked" as const };
    });
  }

  async reportUser(input: {
    id: string;
    reporterUserId: string;
    reportedUserId: string;
    reason: "spam" | "inappropriate" | "safety" | "other";
    details: string | null;
    createdAt: string;
  }) {
    if (input.reporterUserId === input.reportedUserId) return { status: "invalid_target" as const };
    return this.client.transaction(async (transaction) => {
      const users = await lockUsers(transaction, [input.reporterUserId, input.reportedUserId]);
      if (users !== 2) return { status: "invalid_target" as const };
      await transaction.query(
        `INSERT INTO challenge_mate_reports (
           id, reporter_user_id, reported_user_id, reason, details, status, created_at
         ) VALUES ($1, $2, $3, $4, $5, 'open', $6::timestamptz)`,
        [
          input.id,
          input.reporterUserId,
          input.reportedUserId,
          input.reason,
          input.details,
          input.createdAt
        ]
      );
      return { status: "reported" as const };
    });
  }
}

const profileSelect = `SELECT profiles.user_id, profiles.participation_id,
  challenges.id AS challenge_id, challenges.slug AS challenge_slug,
  challenges.title AS challenge_title, users.name AS user_name,
  profiles.goal, profiles.available_from, profiles.available_until,
  profiles.mode, profiles.location,
  (profiles.active AND participations.status = 'active'
    AND COALESCE(privacy.challenge_mate_discoverable, FALSE)) AS active,
  profiles.updated_at
FROM challenge_mate_profiles profiles
JOIN users ON users.id = profiles.user_id
JOIN participations ON participations.id = profiles.participation_id
JOIN challenges ON challenges.id = participations.challenge_id
LEFT JOIN account_privacy_preferences privacy ON privacy.user_id = profiles.user_id`;

async function getProfile(client: PostgresQueryClient, userId: string) {
  const result = await client.query(`${profileSelect} WHERE profiles.user_id = $1`, [userId]);
  const row = result.rows[0] as ProfileRow | undefined;
  return row ? mapProfile(row) : null;
}

async function getProfiles(client: PostgresQueryClient, userIds: string[], activeOnly: boolean) {
  const result = await client.query(
    `${profileSelect}
     WHERE ${activeOnly
       ? "profiles.active = TRUE AND participations.status = 'active' AND COALESCE(privacy.challenge_mate_discoverable, FALSE) = TRUE"
       : "profiles.user_id = ANY($1::text[])"}`,
    activeOnly ? [] : [userIds]
  );
  return (result.rows as ProfileRow[]).map(mapProfile);
}

async function lockUsers(client: PostgresQueryClient, userIds: string[]) {
  const result = await client.query(
    `SELECT id FROM users WHERE id = ANY($1::text[]) ORDER BY id FOR UPDATE`,
    [userIds]
  );
  return result.rows.length;
}

async function isBlocked(client: PostgresQueryClient, firstUserId: string, secondUserId: string) {
  const result = await client.query(
    `SELECT 1 FROM challenge_mate_blocks
     WHERE (blocker_user_id = $1 AND blocked_user_id = $2)
        OR (blocker_user_id = $2 AND blocked_user_id = $1)`,
    [firstUserId, secondUserId]
  );
  return result.rows.length > 0;
}

function mapProfile(row: ProfileRow): ChallengeMateProfile {
  return {
    userId: row.user_id,
    participationId: row.participation_id,
    challengeId: row.challenge_id,
    challengeSlug: row.challenge_slug,
    challengeTitle: row.challenge_title,
    userName: row.user_name,
    goal: row.goal,
    availableFrom: toDateKey(row.available_from),
    availableUntil: toDateKey(row.available_until),
    mode: row.mode,
    location: row.location,
    active: row.active,
    updatedAt: toIso(row.updated_at)
  };
}

function toConnectionView(
  connection: ConnectionRow,
  currentUserId: string,
  profilesByUser: Map<string, ChallengeMateProfile>
): ChallengeMateConnectionView | null {
  const mateUserId = connection.requester_user_id === currentUserId
    ? connection.recipient_user_id
    : connection.requester_user_id;
  const mate = profilesByUser.get(mateUserId);
  if (!mate) return null;
  return {
    connectionId: connection.id,
    mateUserId,
    mateName: mate.userName,
    mateGoal: mate.goal,
    challengeSlug: mate.challengeSlug,
    challengeTitle: mate.challengeTitle,
    mode: mate.mode,
    location: mate.location,
    createdAt: toIso(connection.created_at),
    matchedAt: connection.matched_at === null ? null : toIso(connection.matched_at)
  };
}

function toDateKey(value: Date | string) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
