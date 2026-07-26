import type { DatabaseSync } from "node:sqlite";
import type {
  ChallengeActivityEntry,
  ChallengeParticipationStatsRepository,
  ChallengeRankingCandidate
} from "../../domain/participations/challenge-participation-stats.ts";

type RankingRow = {
  id: string;
  startedAt: string;
  name: string;
  checkInDate: string | null;
};

export class SqliteChallengeParticipationStatsRepository
  implements ChallengeParticipationStatsRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  countByChallengeSlug(slug: string): number {
    const row = this.db
      .prepare(`
        SELECT COUNT(participations.id) as count
        FROM challenges
        LEFT JOIN participations ON participations.challenge_id = challenges.id
        WHERE challenges.slug = ?
      `)
      .get(slug) as unknown as { count: number } | undefined;

    return row?.count ?? 0;
  }

  listCountsByChallengeSlug(): Record<string, number> {
    const rows = this.db
      .prepare(`
        SELECT challenges.slug, COUNT(participations.id) as count
        FROM challenges
        LEFT JOIN participations ON participations.challenge_id = challenges.id
        GROUP BY challenges.slug
      `)
      .all() as unknown as Array<{ slug: string; count: number }>;

    return Object.fromEntries(rows.map((row) => [row.slug, row.count]));
  }

  listActiveRankingCandidates(slug: string): ChallengeRankingCandidate[] {
    const rows = this.db
      .prepare(`
        SELECT
          participations.id,
          participations.started_at as startedAt,
          users.name,
          check_ins.date as checkInDate
        FROM challenges
        JOIN participations ON participations.challenge_id = challenges.id
        JOIN users ON users.id = participations.user_id
        LEFT JOIN check_ins ON check_ins.participation_id = participations.id
        WHERE challenges.slug = ? AND participations.status = 'active'
        ORDER BY participations.started_at ASC, check_ins.date ASC
      `)
      .all(slug) as unknown as RankingRow[];

    const candidates = new Map<string, ChallengeRankingCandidate>();

    for (const row of rows) {
      const candidate = candidates.get(row.id) ?? {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        checkInDates: []
      };

      if (row.checkInDate) {
        candidate.checkInDates.push(row.checkInDate);
      }

      candidates.set(row.id, candidate);
    }

    return Array.from(candidates.values());
  }

  listRecentCheckIns(slug: string, limit: number): ChallengeActivityEntry[] {
    const safeLimit = Math.max(1, Math.min(20, Math.trunc(limit)));

    const rows = this.db
      .prepare(`
        SELECT
          check_ins.id,
          users.name as participantName,
          check_ins.date as checkInDate,
          check_ins.created_at as createdAt
        FROM check_ins
        JOIN participations ON participations.id = check_ins.participation_id
        JOIN challenges ON challenges.id = participations.challenge_id
        JOIN users ON users.id = participations.user_id
        WHERE challenges.slug = ?
        ORDER BY check_ins.created_at DESC, check_ins.id DESC
        LIMIT ?
      `)
      .all(slug, safeLimit) as unknown as ChallengeActivityEntry[];

    return rows.map((row) => ({
      id: row.id,
      participantName: row.participantName,
      checkInDate: row.checkInDate,
      createdAt: row.createdAt
    }));
  }
}