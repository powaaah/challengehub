import type {
  AcceptChallengeInvitationInput,
  AcceptChallengeInvitationResult,
  ActiveChallengeInvitation,
  ChallengeInvitationRepository,
  CreateChallengeInvitationInput,
  CreateChallengeInvitationResult
} from "../../domain/invitations/challenge-invitation-repository.ts";
import type { PostgresTransactionalQueryClient } from "./postgres-query-client.ts";

export class PostgresqlChallengeInvitationRepository
  implements ChallengeInvitationRepository {
  private readonly client: PostgresTransactionalQueryClient;

  constructor(client: PostgresTransactionalQueryClient) {
    this.client = client;
  }

  async create(input: CreateChallengeInvitationInput): Promise<CreateChallengeInvitationResult> {
    const result = await this.client.query(
      `WITH eligible_participation AS (
         SELECT id
         FROM participations
         WHERE id = $2 AND user_id = $3 AND status = 'active'
       ), inserted AS (
         INSERT INTO challenge_invitations (
           id, inviter_participation_id, token_hash, expires_at, created_at,
           accepted_by_user_id, accepted_at, revoked_at
         )
         SELECT $1, id, $4, $5::timestamptz, $6::timestamptz, NULL, NULL, NULL
         FROM eligible_participation
         ON CONFLICT DO NOTHING
         RETURNING id
       )
       SELECT EXISTS (SELECT 1 FROM eligible_participation) AS participation_available,
         EXISTS (SELECT 1 FROM inserted) AS created`,
      [
        input.id,
        input.inviterParticipationId,
        input.inviterUserId,
        input.tokenHash,
        input.expiresAt,
        input.createdAt
      ]
    );
    const row = result.rows[0] as {
      participation_available?: boolean;
      created?: boolean;
    } | undefined;

    if (row?.created) return { status: "created" };
    return row?.participation_available
      ? { status: "token_conflict" }
      : { status: "participation_not_available" };
  }

  async findActiveByTokenHash(
    tokenHash: string,
    now: string
  ): Promise<ActiveChallengeInvitation | null> {
    const result = await this.client.query(
      `SELECT invitations.id,
         invitations.inviter_participation_id,
         participations.user_id AS inviter_user_id,
         participations.challenge_id,
         challenges.slug AS challenge_slug,
         invitations.expires_at
       FROM challenge_invitations invitations
       JOIN participations ON participations.id = invitations.inviter_participation_id
       JOIN challenges ON challenges.id = participations.challenge_id
       WHERE invitations.token_hash = $1
         AND invitations.expires_at > $2::timestamptz
         AND invitations.accepted_at IS NULL
         AND invitations.revoked_at IS NULL
         AND participations.status = 'active'`,
      [tokenHash, now]
    );
    const row = result.rows[0] as InvitationRow | undefined;
    return row ? mapInvitation(row) : null;
  }

  async accept(input: AcceptChallengeInvitationInput): Promise<AcceptChallengeInvitationResult> {
    return this.client.transaction(async (transaction) => {
      const selected = await transaction.query(
        `SELECT invitations.id,
           participations.user_id AS inviter_user_id,
           participations.challenge_id
         FROM challenge_invitations invitations
         JOIN participations ON participations.id = invitations.inviter_participation_id
         JOIN users ON users.id = $1
         WHERE invitations.token_hash = $2
           AND invitations.expires_at > $3::timestamptz
           AND invitations.accepted_at IS NULL
           AND invitations.revoked_at IS NULL
           AND participations.status = 'active'
         FOR UPDATE OF invitations, participations`,
        [input.inviteeUserId, input.tokenHash, input.acceptedAt]
      );
      const invitation = selected.rows[0] as {
        id: string;
        inviter_user_id: string;
        challenge_id: string;
      } | undefined;
      if (!invitation) return { status: "invitation_not_available" };
      if (invitation.inviter_user_id === input.inviteeUserId) {
        return { status: "self_invitation" };
      }

      const participation = await transaction.query(
        `INSERT INTO participations (
           id, user_id, challenge_id, started_at, status, completed_at
         ) VALUES ($1, $2, $3, $4::timestamptz, 'active', NULL)
         ON CONFLICT (user_id, challenge_id) DO UPDATE SET
           status = 'active', completed_at = NULL
         RETURNING id`,
        [
          input.participationId,
          input.inviteeUserId,
          invitation.challenge_id,
          input.acceptedAt
        ]
      );
      const participationId = (participation.rows[0] as { id?: string } | undefined)?.id;
      if (!participationId) return { status: "invitation_not_available" };

      const accepted = await transaction.query(
        `UPDATE challenge_invitations
         SET accepted_by_user_id = $1, accepted_at = $2::timestamptz
         WHERE id = $3 AND accepted_at IS NULL AND revoked_at IS NULL
           AND expires_at > $2::timestamptz
         RETURNING id`,
        [input.inviteeUserId, input.acceptedAt, invitation.id]
      );
      if (accepted.rows.length !== 1) return { status: "invitation_not_available" };

      return { status: "accepted", participationId };
    });
  }
}

type InvitationRow = {
  id: string;
  inviter_participation_id: string;
  inviter_user_id: string;
  challenge_id: string;
  challenge_slug: string;
  expires_at: Date | string;
};

function mapInvitation(row: InvitationRow): ActiveChallengeInvitation {
  return {
    id: row.id,
    inviterParticipationId: row.inviter_participation_id,
    inviterUserId: row.inviter_user_id,
    challengeId: row.challenge_id,
    challengeSlug: row.challenge_slug,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : row.expires_at
  };
}
