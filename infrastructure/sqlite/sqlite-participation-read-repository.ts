import type { DatabaseSync } from "node:sqlite";
import type {
  Participation,
  ParticipationReadRepository
} from "../../domain/participations/participation.ts";
import { parseChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";
import type { ChallengeCheckIn } from "../../domain/challenges/challenge-outcome.ts";

type ParticipationRow = Omit<Participation, "definition"> & {
  challengeType: string;
  metricUnit: string;
  targetValue: number;
  frequency: string;
  measurementDirection: string;
  completionCriterion: string;
};

const participationSelect = `
  SELECT
    participations.id,
    participations.user_id as userId,
    participations.challenge_id as challengeId,
    participations.started_at as startedAt,
    participations.status,
    participations.completed_at as completedAt,
    challenges.slug as challengeSlug,
    challenges.title as challengeTitle,
    challenges.goal as challengeGoal,
    challenges.challenge_type as challengeType,
    challenges.metric_unit as metricUnit,
    challenges.target_value as targetValue,
    challenges.frequency,
    challenges.measurement_direction as measurementDirection,
    challenges.completion_criterion as completionCriterion
  FROM participations
  JOIN challenges ON challenges.id = participations.challenge_id
`;

export class SqliteParticipationReadRepository implements ParticipationReadRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  listForUser(userId: string): Participation[] {
    const rows = this.db
      .prepare(`${participationSelect}
        WHERE participations.user_id = ?
        ORDER BY participations.started_at DESC`)
      .all(userId) as unknown as ParticipationRow[];
    return rows.map(mapParticipationRow);
  }

  findByIdForUser(participationId: string, userId: string): Participation | null {
    const row = this.db
      .prepare(`${participationSelect}
        WHERE participations.id = ? AND participations.user_id = ?`)
      .get(participationId, userId) as unknown as ParticipationRow | undefined;

    return row ? mapParticipationRow(row) : null;
  }

  listCheckInDatesForUser(participationId: string, userId: string): string[] {
    return this.listCheckInsForUser(participationId, userId).map((checkIn) => checkIn.date);
  }

  listCheckInsForUser(participationId: string, userId: string): ChallengeCheckIn[] {
    const rows = this.db
      .prepare(`
        SELECT check_ins.date, check_ins.value
        FROM check_ins
        JOIN participations ON participations.id = check_ins.participation_id
        WHERE check_ins.participation_id = ? AND participations.user_id = ?
        ORDER BY check_ins.date ASC
      `)
      .all(participationId, userId) as unknown as ChallengeCheckIn[];

    return rows.map((row) => ({ date: row.date, value: row.value }));
  }
}

function mapParticipationRow(row: ParticipationRow): Participation {
  const definition = parseChallengeDefinition({
    type: row.challengeType,
    unit: row.metricUnit,
    targetValue: row.targetValue,
    frequency: row.frequency,
    direction: row.measurementDirection,
    completionCriterion: row.completionCriterion
  });
  if (!definition) {
    throw new Error(`Invalid challenge definition for participation ${row.id}.`);
  }
  return {
    id: row.id,
    userId: row.userId,
    challengeId: row.challengeId,
    challengeSlug: row.challengeSlug,
    challengeTitle: row.challengeTitle,
    challengeGoal: row.challengeGoal,
    startedAt: row.startedAt,
    status: row.status,
    completedAt: row.completedAt,
    definition
  };
}
