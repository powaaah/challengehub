import { randomUUID } from "node:crypto";
import type {
  CheckInWriteRepository,
  CreateCheckInInput,
  CreateCheckInResult
} from "../../domain/participations/check-in-write-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type IdFactory = () => string;
type Clock = () => string;
type ParticipationDefinitionRow = {
  challenge_type: string;
  target_value: number | string;
  measurement_direction: string;
  completion_criterion: string;
};

export class PostgresqlCheckInWriteRepository implements CheckInWriteRepository {
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

  async createForUser(input: CreateCheckInInput): Promise<CreateCheckInResult> {
    return this.client.transaction(async (transaction) => {
      const definition = await lockActiveParticipation(transaction, input);
      if (!definition) return "participation_not_found";

      const isMetricChallenge = definition.challenge_type !== "daily_boolean";
      if (
        (isMetricChallenge && !isPositiveFiniteNumber(input.value)) ||
        (!isMetricChallenge && input.value !== undefined)
      ) {
        return "invalid_value";
      }

      const now = this.now();
      const insert = await transaction.query(
        `INSERT INTO check_ins (id, participation_id, date, value, note, created_at)
         VALUES ($1, $2, $3::date, $4, NULL, $5::timestamptz)
         ON CONFLICT (participation_id, date) DO NOTHING
         RETURNING id`,
        [this.createId(), input.participationId, input.date, input.value ?? null, now]
      );
      if (insert.rows.length === 0) return "already_exists";

      if (definition.completion_criterion !== "daily_check_in") {
        const aggregate = definition.completion_criterion === "cumulative_target"
          ? "SUM(value)"
          : definition.measurement_direction === "at_most" ? "MIN(value)" : "MAX(value)";
        const result = await transaction.query(
          `SELECT ${aggregate} AS aggregate_value
           FROM check_ins
           WHERE participation_id = $1 AND value IS NOT NULL`,
          [input.participationId]
        );
        const value = Number((result.rows[0] as { aggregate_value?: number | string | null })
          ?.aggregate_value);
        const target = Number(definition.target_value);
        const reached = Number.isFinite(value) && Number.isFinite(target) && (
          definition.measurement_direction === "at_least" ? value >= target : value <= target
        );
        if (reached) {
          await transaction.query(
            `UPDATE participations
             SET status = 'completed', completed_at = $1::timestamptz
             WHERE id = $2 AND status = 'active'
             RETURNING id`,
            [now, input.participationId]
          );
        }
      }

      return "created";
    });
  }
}

async function lockActiveParticipation(
  client: PostgresQueryClient,
  input: CreateCheckInInput
): Promise<ParticipationDefinitionRow | null> {
  const result = await client.query(
    `SELECT
       challenges.challenge_type, challenges.target_value,
       challenges.measurement_direction, challenges.completion_criterion
     FROM participations
     JOIN challenges ON challenges.id = participations.challenge_id
     WHERE participations.id = $1
       AND participations.user_id = $2
       AND participations.status = 'active'
     FOR UPDATE OF participations`,
    [input.participationId, input.userId]
  );
  return (result.rows[0] as ParticipationDefinitionRow | undefined) ?? null;
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}