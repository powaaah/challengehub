import type { DatabaseSync } from "node:sqlite";
import type {
  ChallengeActivityEntry,
  ChallengeParticipationStatsRepository,
  ChallengeRankingCandidate
} from "../../domain/participations/challenge-participation-stats.ts";
import { parseChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";

type RankingRow = {
  id: string;
  startedAt: string;
  name: string;
  checkInDate: string | null;
  checkInValue: number | null;
  challengeType: string;
  metricUnit: string;
  targetValue: number;
  frequency: string;
  measurementDirection: string;
  completionCriterion: string;
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

  listActiveRankingCandidates(slug: string, options: { publicOnly?: boolean } = {}): ChallengeRankingCandidate[] {
    const rows = this.db
      .prepare(`
        SELECT
          participations.id,
          participations.started_at as startedAt,
          users.name,
          check_ins.date as checkInDate,
          check_ins.value as checkInValue,
          challenges.challenge_type as challengeType,
          challenges.metric_unit as metricUnit,
          challenges.target_value as targetValue,
          challenges.frequency,
          challenges.measurement_direction as measurementDirection,
          challenges.completion_criterion as completionCriterion
        FROM challenges
        JOIN participations ON participations.challenge_id = challenges.id
        JOIN users ON users.id = participations.user_id
        LEFT JOIN account_privacy_preferences privacy ON privacy.user_id = users.id
        LEFT JOIN check_ins ON check_ins.participation_id = participations.id
        WHERE challenges.slug = ?
          AND (? = 0 OR COALESCE(privacy.ranking_visible, 0) = 1)
          AND (
            participations.status = 'active'
            OR (challenges.challenge_type <> 'daily_boolean' AND participations.status = 'completed')
          )
        ORDER BY participations.started_at ASC, check_ins.date ASC
      `)
      .all(slug, Number(options.publicOnly ?? false)) as unknown as RankingRow[];

    const candidates = new Map<string, ChallengeRankingCandidate>();

    for (const row of rows) {
      const definition = parseChallengeDefinition({
        type: row.challengeType,
        unit: row.metricUnit,
        targetValue: row.targetValue,
        frequency: row.frequency,
        direction: row.measurementDirection,
        completionCriterion: row.completionCriterion
      });
      if (!definition) {
        throw new Error(`Invalid challenge definition for ranking ${slug}.`);
      }
      const candidate = candidates.get(row.id) ?? {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        checkIns: [],
        definition
      };

      if (row.checkInDate) {
        candidate.checkIns.push({ date: row.checkInDate, value: row.checkInValue });
      }

      candidates.set(row.id, candidate);
    }

    return Array.from(candidates.values());
  }

  listRecentCheckIns(slug: string, limit: number, options: { publicOnly?: boolean } = {}): ChallengeActivityEntry[] {
    const safeLimit = Math.max(1, Math.min(20, Math.trunc(limit)));

    const rows = this.db
      .prepare(`
        SELECT
          check_ins.id,
          users.name as participantName,
          check_ins.date as checkInDate,
          check_ins.value as value,
          check_ins.created_at as createdAt
        FROM check_ins
        JOIN participations ON participations.id = check_ins.participation_id
        JOIN challenges ON challenges.id = participations.challenge_id
        JOIN users ON users.id = participations.user_id
        LEFT JOIN account_privacy_preferences privacy ON privacy.user_id = users.id
        WHERE challenges.slug = ?
          AND (? = 0 OR COALESCE(privacy.activity_visible, 0) = 1)
        ORDER BY check_ins.created_at DESC, check_ins.id DESC
        LIMIT ?
      `)
      .all(slug, Number(options.publicOnly ?? false), safeLimit) as unknown as ChallengeActivityEntry[];

    return rows.map((row) => ({
      id: row.id,
      participantName: row.participantName,
      checkInDate: row.checkInDate,
      value: row.value,
      createdAt: row.createdAt
    }));
  }
}
