import type { DatabaseSync } from "node:sqlite";
import type {
  Participation,
  ParticipationReadRepository
} from "../../domain/participations/participation.ts";

type ParticipationRow = Participation;

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
    challenges.goal as challengeGoal
  FROM participations
  JOIN challenges ON challenges.id = participations.challenge_id
`;

export class SqliteParticipationReadRepository implements ParticipationReadRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  listForUser(userId: string): Participation[] {
    return this.db
      .prepare(`${participationSelect}
        WHERE participations.user_id = ?
        ORDER BY participations.started_at DESC`)
      .all(userId) as unknown as ParticipationRow[];
  }

  findByIdForUser(participationId: string, userId: string): Participation | null {
    const row = this.db
      .prepare(`${participationSelect}
        WHERE participations.id = ? AND participations.user_id = ?`)
      .get(participationId, userId) as unknown as ParticipationRow | undefined;

    return row ?? null;
  }

  listCheckInDatesForUser(participationId: string, userId: string): string[] {
    const rows = this.db
      .prepare(`
        SELECT check_ins.date
        FROM check_ins
        JOIN participations ON participations.id = check_ins.participation_id
        WHERE check_ins.participation_id = ? AND participations.user_id = ?
        ORDER BY check_ins.date ASC
      `)
      .all(participationId, userId) as unknown as Array<{ date: string }>;

    return rows.map((row) => row.date);
  }
}