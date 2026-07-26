import type { DatabaseSync } from "node:sqlite";
import type {
  AcceptChallengeInvitationInput,
  AcceptChallengeInvitationResult,
  ActiveChallengeInvitation,
  ChallengeInvitationRepository,
  CreateChallengeInvitationInput,
  CreateChallengeInvitationResult
} from "../../domain/invitations/challenge-invitation-repository.ts";

type ActiveChallengeInvitationRow = {
  id: string;
  inviterParticipationId: string;
  inviterUserId: string;
  challengeId: string;
  challengeSlug: string;
  expiresAt: string;
};

export class SqliteChallengeInvitationRepository implements ChallengeInvitationRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  create(input: CreateChallengeInvitationInput): CreateChallengeInvitationResult {
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO challenge_invitations (
          id,
          inviter_participation_id,
          token_hash,
          expires_at,
          created_at,
          accepted_by_user_id,
          accepted_at,
          revoked_at
        )
        SELECT ?, participations.id, ?, ?, ?, NULL, NULL, NULL
        FROM participations
        WHERE participations.id = ?
          AND participations.user_id = ?
          AND participations.status = 'active'
      `)
      .run(
        input.id,
        input.tokenHash,
        input.expiresAt,
        input.createdAt,
        input.inviterParticipationId,
        input.inviterUserId
      );

    if (insert.changes === 1) {
      return { status: "created" };
    }

    const tokenExists = this.db
      .prepare("SELECT 1 FROM challenge_invitations WHERE token_hash = ?")
      .get(input.tokenHash);

    return tokenExists
      ? { status: "token_conflict" }
      : { status: "participation_not_available" };
  }

  findActiveByTokenHash(tokenHash: string, now: string): ActiveChallengeInvitation | null {
    const row = this.db
      .prepare(`
        SELECT
          invitations.id,
          invitations.inviter_participation_id AS inviterParticipationId,
          participations.user_id AS inviterUserId,
          participations.challenge_id AS challengeId,
          challenges.slug AS challengeSlug,
          invitations.expires_at AS expiresAt
        FROM challenge_invitations invitations
        JOIN participations ON participations.id = invitations.inviter_participation_id
        JOIN challenges ON challenges.id = participations.challenge_id
        WHERE invitations.token_hash = ?
          AND invitations.expires_at > ?
          AND invitations.accepted_at IS NULL
          AND invitations.revoked_at IS NULL
          AND participations.status = 'active'
      `)
      .get(tokenHash, now) as ActiveChallengeInvitationRow | undefined;

    return row ? { ...row } : null;
  }

  accept(input: AcceptChallengeInvitationInput): AcceptChallengeInvitationResult {
    this.db.exec("BEGIN IMMEDIATE");

    try {
      const invitation = this.db
        .prepare(`
          SELECT
            invitations.id,
            participations.user_id AS inviterUserId,
            participations.challenge_id AS challengeId
          FROM challenge_invitations invitations
          JOIN participations ON participations.id = invitations.inviter_participation_id
          JOIN users ON users.id = ?
          WHERE invitations.token_hash = ?
            AND invitations.expires_at > ?
            AND invitations.accepted_at IS NULL
            AND invitations.revoked_at IS NULL
            AND participations.status = 'active'
        `)
        .get(input.inviteeUserId, input.tokenHash, input.acceptedAt) as
        | { id: string; inviterUserId: string; challengeId: string }
        | undefined;

      if (!invitation) {
        this.db.exec("ROLLBACK");
        return { status: "invitation_not_available" };
      }

      if (invitation.inviterUserId === input.inviteeUserId) {
        this.db.exec("ROLLBACK");
        return { status: "self_invitation" };
      }

      this.db
        .prepare(`
          INSERT INTO participations (
            id, user_id, challenge_id, started_at, status, completed_at
          ) VALUES (?, ?, ?, ?, 'active', NULL)
          ON CONFLICT (user_id, challenge_id) DO UPDATE SET
            status = 'active',
            completed_at = NULL
        `)
        .run(
          input.participationId,
          input.inviteeUserId,
          invitation.challengeId,
          input.acceptedAt
        );

      const participation = this.db
        .prepare("SELECT id FROM participations WHERE user_id = ? AND challenge_id = ?")
        .get(input.inviteeUserId, invitation.challengeId) as { id: string };

      const accepted = this.db
        .prepare(`
          UPDATE challenge_invitations
          SET accepted_by_user_id = ?, accepted_at = ?
          WHERE id = ?
            AND accepted_at IS NULL
            AND revoked_at IS NULL
            AND expires_at > ?
        `)
        .run(input.inviteeUserId, input.acceptedAt, invitation.id, input.acceptedAt);

      if (accepted.changes !== 1) {
        this.db.exec("ROLLBACK");
        return { status: "invitation_not_available" };
      }

      this.db.exec("COMMIT");
      return { status: "accepted", participationId: participation.id };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}
