import { parseChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";
import type { ChallengeCheckIn } from "../../domain/challenges/challenge-outcome.ts";
import type {
  Participation,
  ParticipationReadRepository
} from "../../domain/participations/participation.ts";
import type { PostgresQueryClient } from "./postgres-query-client.ts";

type PostgresParticipationRow = {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: Date | string;
  status: string;
  completed_at: Date | string | null;
  challenge_slug: string;
  challenge_title: string;
  challenge_goal: string;
  challenge_type: string;
  metric_unit: string;
  target_value: number;
  frequency: string;
  measurement_direction: string;
  completion_criterion: string;
};

type PostgresCheckInRow = {
  date: Date | string;
  value: number | null;
};

const participationSelect = `
  SELECT
    participations.id,
    participations.user_id,
    participations.challenge_id,
    participations.started_at,
    participations.status,
    participations.completed_at,
    challenges.slug AS challenge_slug,
    challenges.title AS challenge_title,
    challenges.goal AS challenge_goal,
    challenges.challenge_type,
    challenges.metric_unit,
    challenges.target_value,
    challenges.frequency,
    challenges.measurement_direction,
    challenges.completion_criterion
  FROM participations
  JOIN challenges ON challenges.id = participations.challenge_id
`;

export class PostgresqlParticipationReadRepository implements ParticipationReadRepository {
  private readonly client: PostgresQueryClient;

  constructor(client: PostgresQueryClient) {
    this.client = client;
  }

  async listForUser(userId: string): Promise<Participation[]> {
    const result = await this.client.query(
      `${participationSelect}
        WHERE participations.user_id = $1
        ORDER BY participations.started_at DESC`,
      [userId]
    );

    return (result.rows as PostgresParticipationRow[]).map(mapParticipationRow);
  }

  async findByIdForUser(participationId: string, userId: string): Promise<Participation | null> {
    const result = await this.client.query(
      `${participationSelect}
        WHERE participations.id = $1 AND participations.user_id = $2
        LIMIT 1`,
      [participationId, userId]
    );
    const row = result.rows[0] as PostgresParticipationRow | undefined;

    return row ? mapParticipationRow(row) : null;
  }

  async listCheckInDatesForUser(participationId: string, userId: string): Promise<string[]> {
    const checkIns = await this.listCheckInsForUser(participationId, userId);
    return checkIns.map((checkIn) => checkIn.date);
  }

  async listCheckInsForUser(
    participationId: string,
    userId: string
  ): Promise<ChallengeCheckIn[]> {
    const result = await this.client.query(
      `
        SELECT check_ins.date, check_ins.value
        FROM check_ins
        JOIN participations ON participations.id = check_ins.participation_id
        WHERE check_ins.participation_id = $1 AND participations.user_id = $2
        ORDER BY check_ins.date ASC
      `,
      [participationId, userId]
    );

    return (result.rows as PostgresCheckInRow[]).map((row) => ({
      date: formatDate(row.date),
      value: row.value
    }));
  }
}

function mapParticipationRow(row: PostgresParticipationRow): Participation {
  const definition = parseChallengeDefinition({
    type: row.challenge_type,
    unit: row.metric_unit,
    targetValue: row.target_value,
    frequency: row.frequency,
    direction: row.measurement_direction,
    completionCriterion: row.completion_criterion
  });
  if (!definition) {
    throw new Error(`Invalid challenge definition for participation ${row.id}.`);
  }

  return {
    id: row.id,
    userId: row.user_id,
    challengeId: row.challenge_id,
    challengeSlug: row.challenge_slug,
    challengeTitle: row.challenge_title,
    challengeGoal: row.challenge_goal,
    startedAt: formatTimestamp(row.started_at),
    status: row.status,
    completedAt: row.completed_at === null ? null : formatTimestamp(row.completed_at),
    definition
  };
}

function formatTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function formatDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}
