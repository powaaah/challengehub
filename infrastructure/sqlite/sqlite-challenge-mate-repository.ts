import type { DatabaseSync } from "node:sqlite";
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

type ConnectionRow = {
  id: string;
  requesterUserId: string;
  recipientUserId: string;
  status: "pending" | "matched";
  createdAt: string;
  matchedAt: string | null;
};

type ProfileRow = Omit<ChallengeMateProfile, "active"> & { active: number };

export class SqliteChallengeMateRepository implements ChallengeMateRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  saveProfile(input: SaveChallengeMateProfileInput) {
    const existing = this.db.prepare(`
      SELECT participation_id AS participationId
      FROM challenge_mate_profiles WHERE user_id = ?
    `).get(input.userId) as { participationId: string } | undefined;
    const hasActiveMatch = Boolean(this.db.prepare(`
      SELECT 1 FROM challenge_mate_connections
      WHERE status = 'matched' AND (requester_user_id = ? OR recipient_user_id = ?)
    `).get(input.userId, input.userId));
    if (existing && existing.participationId !== input.participationId && hasActiveMatch) {
      return { status: "active_match_conflict" as const };
    }

    const result = this.db.prepare(`
      INSERT INTO challenge_mate_profiles (
        user_id, participation_id, goal, available_from, available_until,
        mode, location, active, updated_at
      )
      SELECT ?, participations.id, ?, ?, ?, ?, ?, 1, ?
      FROM participations
      WHERE participations.id = ?
        AND participations.user_id = ?
        AND participations.status = 'active'
      ON CONFLICT (user_id) DO UPDATE SET
        participation_id = excluded.participation_id,
        goal = excluded.goal,
        available_from = excluded.available_from,
        available_until = excluded.available_until,
        mode = excluded.mode,
        location = excluded.location,
        active = 1,
        updated_at = excluded.updated_at
    `).run(
      input.userId,
      input.goal,
      input.availableFrom,
      input.availableUntil,
      input.mode,
      input.location,
      input.updatedAt,
      input.participationId,
      input.userId
    );
    return result.changes === 1
      ? { status: "saved" as const }
      : { status: "participation_not_available" as const };
  }

  deactivateProfile(userId: string, updatedAt: string) {
    const result = this.db.prepare(`
      UPDATE challenge_mate_profiles SET active = 0, updated_at = ? WHERE user_id = ?
    `).run(updatedAt, userId);
    return result.changes === 1
      ? { status: "deactivated" as const }
      : { status: "not_found" as const };
  }

  getDashboard(userId: string): ChallengeMateDashboard {
    const profile = this.getProfile(userId);
    const blockedUsers = new Set((this.db.prepare(`
      SELECT blocked_user_id AS userId FROM challenge_mate_blocks WHERE blocker_user_id = ?
      UNION
      SELECT blocker_user_id AS userId FROM challenge_mate_blocks WHERE blocked_user_id = ?
    `).all(userId, userId) as Array<{ userId: string }>).map(({ userId: id }) => id));
    const connections = this.db.prepare(`
      SELECT id, requester_user_id AS requesterUserId, recipient_user_id AS recipientUserId,
        status, created_at AS createdAt, matched_at AS matchedAt
      FROM challenge_mate_connections
      WHERE (requester_user_id = ? OR recipient_user_id = ?)
        AND status IN ('pending', 'matched')
      ORDER BY created_at DESC
    `).all(userId, userId) as ConnectionRow[];
    const connectedUsers = new Set(connections.flatMap((connection) => [
      connection.requesterUserId,
      connection.recipientUserId
    ]).filter((id) => id !== userId));
    const toView = (connection: ConnectionRow) => this.toConnectionView(connection, userId);

    const suggestions = profile
      ? this.listActiveProfiles()
          .filter((candidate) => !blockedUsers.has(candidate.userId))
          .filter((candidate) => !connectedUsers.has(candidate.userId))
          .filter((candidate) => areChallengeMateProfilesCompatible(profile, candidate))
      : [];

    return {
      profile,
      suggestions,
      incoming: connections
        .filter((connection) => connection.status === "pending" && connection.recipientUserId === userId)
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null),
      outgoing: connections
        .filter((connection) => connection.status === "pending" && connection.requesterUserId === userId)
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null),
      matches: connections
        .filter((connection) => connection.status === "matched")
        .map(toView)
        .filter((entry): entry is ChallengeMateConnectionView => entry !== null)
    };
  }

  requestMatch(input: {
    id: string;
    requesterUserId: string;
    recipientUserId: string;
    createdAt: string;
  }) {
    const requester = this.getProfile(input.requesterUserId);
    const recipient = this.getProfile(input.recipientUserId);
    if (!requester || !recipient || !areChallengeMateProfilesCompatible(requester, recipient)) {
      return { status: "not_available" as const };
    }
    if (this.isBlocked(input.requesterUserId, input.recipientUserId)) {
      return { status: "not_available" as const };
    }
    const [low, high] = [input.requesterUserId, input.recipientUserId].sort();
    const result = this.db.prepare(`
      INSERT OR IGNORE INTO challenge_mate_connections (
        id, requester_user_id, recipient_user_id, user_low_id, user_high_id,
        status, created_at, matched_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?, NULL)
    `).run(input.id, input.requesterUserId, input.recipientUserId, low, high, input.createdAt);
    return result.changes === 1
      ? { status: "requested" as const, connectionId: input.id }
      : { status: "already_exists" as const };
  }

  acceptMatch(input: { connectionId: string; recipientUserId: string; acceptedAt: string }) {
    const connection = this.db.prepare(`
      SELECT requester_user_id AS requesterUserId, recipient_user_id AS recipientUserId
      FROM challenge_mate_connections
      WHERE id = ? AND recipient_user_id = ? AND status = 'pending'
    `).get(input.connectionId, input.recipientUserId) as
      | { requesterUserId: string; recipientUserId: string }
      | undefined;
    if (!connection) return { status: "not_available" as const };
    const requester = this.getProfile(connection.requesterUserId);
    const recipient = this.getProfile(connection.recipientUserId);
    if (!requester || !recipient || !areChallengeMateProfilesCompatible(requester, recipient)) {
      return { status: "not_available" as const };
    }

    const result = this.db.prepare(`
      UPDATE challenge_mate_connections
      SET status = 'matched', matched_at = ?
      WHERE id = ? AND recipient_user_id = ? AND status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM challenge_mate_blocks
          WHERE (blocker_user_id = requester_user_id AND blocked_user_id = recipient_user_id)
             OR (blocker_user_id = recipient_user_id AND blocked_user_id = requester_user_id)
        )
    `).run(input.acceptedAt, input.connectionId, input.recipientUserId);
    return result.changes === 1
      ? { status: "matched" as const, connectionId: input.connectionId }
      : { status: "not_available" as const };
  }

  blockUser(input: { blockerUserId: string; blockedUserId: string; createdAt: string }) {
    if (input.blockerUserId === input.blockedUserId || !this.usersExist(input.blockerUserId, input.blockedUserId)) {
      return { status: "invalid_target" as const };
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare(`
        INSERT INTO challenge_mate_blocks (blocker_user_id, blocked_user_id, created_at)
        VALUES (?, ?, ?)
        ON CONFLICT (blocker_user_id, blocked_user_id) DO NOTHING
      `).run(input.blockerUserId, input.blockedUserId, input.createdAt);
      this.db.prepare(`
        UPDATE challenge_mate_connections SET status = 'blocked', matched_at = NULL
        WHERE user_low_id = ? AND user_high_id = ?
      `).run(...[input.blockerUserId, input.blockedUserId].sort());
      this.db.exec("COMMIT");
      return { status: "blocked" as const };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  reportUser(input: {
    id: string;
    reporterUserId: string;
    reportedUserId: string;
    reason: "spam" | "inappropriate" | "safety" | "other";
    details: string | null;
    createdAt: string;
  }) {
    if (input.reporterUserId === input.reportedUserId || !this.usersExist(input.reporterUserId, input.reportedUserId)) {
      return { status: "invalid_target" as const };
    }
    this.db.prepare(`
      INSERT INTO challenge_mate_reports (
        id, reporter_user_id, reported_user_id, reason, details, status, created_at
      ) VALUES (?, ?, ?, ?, ?, 'open', ?)
    `).run(
      input.id,
      input.reporterUserId,
      input.reportedUserId,
      input.reason,
      input.details,
      input.createdAt
    );
    return { status: "reported" as const };
  }

  private getProfile(userId: string) {
    const row = this.profileQuery("WHERE profiles.user_id = ?").get(userId) as ProfileRow | undefined;
    return row ? mapProfileRow(row) : null;
  }

  private listActiveProfiles() {
    return this.profileQuery("WHERE profiles.active = 1 AND participations.status = 'active'")
      .all()
      .map((row) => mapProfileRow(row as unknown as ProfileRow));
  }

  private profileQuery(where: string) {
    return this.db.prepare(`
      SELECT profiles.user_id AS userId, profiles.participation_id AS participationId,
        challenges.id AS challengeId, challenges.slug AS challengeSlug,
        challenges.title AS challengeTitle, users.name AS userName,
        profiles.goal, profiles.available_from AS availableFrom,
        profiles.available_until AS availableUntil, profiles.mode, profiles.location,
        (profiles.active = 1 AND participations.status = 'active') AS active,
        profiles.updated_at AS updatedAt
      FROM challenge_mate_profiles profiles
      JOIN users ON users.id = profiles.user_id
      JOIN participations ON participations.id = profiles.participation_id
      JOIN challenges ON challenges.id = participations.challenge_id
      ${where}
    `);
  }

  private toConnectionView(connection: ConnectionRow, currentUserId: string): ChallengeMateConnectionView | null {
    const mateUserId = connection.requesterUserId === currentUserId
      ? connection.recipientUserId
      : connection.requesterUserId;
    const mate = this.getProfile(mateUserId);
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
      createdAt: connection.createdAt,
      matchedAt: connection.matchedAt
    };
  }

  private isBlocked(firstUserId: string, secondUserId: string) {
    return Boolean(this.db.prepare(`
      SELECT 1 FROM challenge_mate_blocks
      WHERE (blocker_user_id = ? AND blocked_user_id = ?)
         OR (blocker_user_id = ? AND blocked_user_id = ?)
    `).get(firstUserId, secondUserId, secondUserId, firstUserId));
  }

  private usersExist(firstUserId: string, secondUserId: string) {
    const row = this.db.prepare("SELECT COUNT(*) AS count FROM users WHERE id IN (?, ?)")
      .get(firstUserId, secondUserId) as { count: number };
    return row.count === 2;
  }
}

function mapProfileRow(row: ProfileRow): ChallengeMateProfile {
  return { ...row, active: row.active === 1 };
}
