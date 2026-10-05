import { randomUUID } from "node:crypto";
import type {
  LeaveParticipationInput,
  LeaveParticipationResult,
  ParticipationWriteRepository,
  StartParticipationInput,
  StartParticipationResult
} from "../../domain/participations/participation-write-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type IdFactory = () => string;
type Clock = () => string;

export class PostgresqlParticipationWriteRepository
  implements ParticipationWriteRepository {
  private readonly client: PostgresTransactionalQueryClient;
  private readonly createId: IdFactory;
  private readonly now: Clock;

  constructor(
    client: PostgresTransactionalQueryClient,
    createId: IdFactory = randomUUID,
    now: Clock = () => new Date().toISOString()
  ) {
    this.client = client;
    this.createId = createId;
    this.now = now;
  }

  async startForUser(input: StartParticipationInput): Promise<StartParticipationResult> {
    return this.client.transaction(async (transaction) => {
      const participationId = this.createId();
      const insert = await transaction.query(
        `INSERT INTO participations (
           id, user_id, challenge_id, started_at, status, completed_at
         )
         SELECT $1, users.id, challenges.id, $4::timestamptz, 'active', NULL
         FROM challenges
         JOIN users ON users.id = $2
         WHERE challenges.id = $3 AND challenges.status = 'published'
         ON CONFLICT (user_id, challenge_id) DO NOTHING
         RETURNING id`,
        [participationId, input.userId, input.challengeId, this.now()]
      );

      if (insert.rows.length === 1) {
        return { status: "created", participationId };
      }

      const existing = await findExistingParticipation(transaction, input);
      if (existing) {
        return { status: "already_exists", participationId: existing.id };
      }

      return { status: "challenge_not_available" };
    });
  }

  async leaveForUser(input: LeaveParticipationInput): Promise<LeaveParticipationResult> {
    return this.client.transaction(async (transaction) => {
      const update = await transaction.query(
        `UPDATE participations
         SET status = 'cancelled', completed_at = $1::timestamptz
         WHERE id = $2 AND user_id = $3 AND status = 'active'
         RETURNING id`,
        [this.now(), input.participationId, input.userId]
      );
      if (update.rows.length === 1) return { status: "left" };

      const existing = await transaction.query(
        `SELECT 1 AS found
         FROM participations
         WHERE id = $1 AND user_id = $2`,
        [input.participationId, input.userId]
      );
      return { status: existing.rows.length === 1 ? "already_inactive" : "not_found" };
    });
  }
}

async function findExistingParticipation(
  client: PostgresQueryClient,
  input: StartParticipationInput
): Promise<{ id: string } | null> {
  const result = await client.query(
    `SELECT id
     FROM participations
     WHERE user_id = $1 AND challenge_id = $2`,
    [input.userId, input.challengeId]
  );
  return (result.rows[0] as { id: string } | undefined) ?? null;
}