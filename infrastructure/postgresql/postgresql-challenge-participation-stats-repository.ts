import { parseChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";
import type {
  ChallengeActivityEntry,
  ChallengeParticipationStatsRepository,
  ChallengeRankingCandidate
} from "../../domain/participations/challenge-participation-stats.ts";
import type { PostgresQueryClient } from "./postgres-query-client.ts";

type CountRow = { slug?: string; count: number | string };
type RankingRow = {
  id: string;
  started_at: Date | string;
  name: string;
  check_in_date: Date | string | null;
  check_in_value: number | null;
  challenge_type: string;
  metric_unit: string;
  target_value: number;
  frequency: string;
  measurement_direction: string;
  completion_criterion: string;
};
type ActivityRow = {
  id: string;
  participant_name: string;
  check_in_date: Date | string;
  value: number | null;
  created_at: Date | string;
};

export class PostgresqlChallengeParticipationStatsRepository
  implements ChallengeParticipationStatsRepository {
  private readonly client: PostgresQueryClient;

  constructor(client: PostgresQueryClient) {
    this.client = client;
  }

  async countByChallengeSlug(slug: string): Promise<number> {
    const result = await this.client.query(
      `SELECT COUNT(participations.id) AS count
       FROM challenges
       LEFT JOIN participations ON participations.challenge_id = challenges.id
       WHERE challenges.slug = $1`,
      [slug]
    );
    return toCount((result.rows[0] as CountRow | undefined)?.count);
  }

  async listCountsByChallengeSlug(): Promise<Record<string, number>> {
    const result = await this.client.query(
      `SELECT challenges.slug, COUNT(participations.id) AS count
       FROM challenges
       LEFT JOIN participations ON participations.challenge_id = challenges.id
       GROUP BY challenges.slug`
    );
    return Object.fromEntries(
      (result.rows as CountRow[]).map((row) => [row.slug as string, toCount(row.count)])
    );
  }

  async listActiveRankingCandidates(
    slug: string,
    options: { publicOnly?: boolean } = {}
  ): Promise<ChallengeRankingCandidate[]> {
    const result = await this.client.query(
      `SELECT
         participations.id, participations.started_at, users.name,
         check_ins.date AS check_in_date, check_ins.value AS check_in_value,
         challenges.challenge_type, challenges.metric_unit, challenges.target_value,
         challenges.frequency, challenges.measurement_direction,
         challenges.completion_criterion
       FROM challenges
       JOIN participations ON participations.challenge_id = challenges.id
       JOIN users ON users.id = participations.user_id
       LEFT JOIN account_privacy_preferences privacy ON privacy.user_id = users.id
       LEFT JOIN check_ins ON check_ins.participation_id = participations.id
       WHERE challenges.slug = $1
         AND ($2::boolean = FALSE OR COALESCE(privacy.ranking_visible, FALSE) = TRUE)
         AND (
           participations.status = 'active'
           OR (challenges.challenge_type <> 'daily_boolean' AND participations.status = 'completed')
         )
       ORDER BY participations.started_at ASC, check_ins.date ASC`,
      [slug, options.publicOnly ?? false]
    );
    const candidates = new Map<string, ChallengeRankingCandidate>();

    for (const row of result.rows as RankingRow[]) {
      const definition = parseChallengeDefinition({
        type: row.challenge_type,
        unit: row.metric_unit,
        targetValue: row.target_value,
        frequency: row.frequency,
        direction: row.measurement_direction,
        completionCriterion: row.completion_criterion
      });
      if (!definition) {
        throw new Error(`Invalid challenge definition for ranking ${slug}.`);
      }
      const candidate = candidates.get(row.id) ?? {
        id: row.id,
        name: row.name,
        startedAt: formatTimestamp(row.started_at),
        checkIns: [],
        definition
      };
      if (row.check_in_date !== null) {
        candidate.checkIns.push({
          date: formatDate(row.check_in_date),
          value: row.check_in_value
        });
      }
      candidates.set(row.id, candidate);
    }
    return Array.from(candidates.values());
  }

  async listRecentCheckIns(
    slug: string,
    limit: number,
    options: { publicOnly?: boolean } = {}
  ): Promise<ChallengeActivityEntry[]> {
    const safeLimit = Math.max(1, Math.min(20, Math.trunc(limit)));
    const result = await this.client.query(
      `SELECT
         check_ins.id, users.name AS participant_name, check_ins.date AS check_in_date,
         check_ins.value, check_ins.created_at
       FROM check_ins
       JOIN participations ON participations.id = check_ins.participation_id
       JOIN challenges ON challenges.id = participations.challenge_id
       JOIN users ON users.id = participations.user_id
       LEFT JOIN account_privacy_preferences privacy ON privacy.user_id = users.id
       WHERE challenges.slug = $1
         AND ($2::boolean = FALSE OR COALESCE(privacy.activity_visible, FALSE) = TRUE)
       ORDER BY check_ins.created_at DESC, check_ins.id DESC
       LIMIT $3`,
      [slug, options.publicOnly ?? false, safeLimit]
    );
    return (result.rows as ActivityRow[]).map((row) => ({
      id: row.id,
      participantName: row.participant_name,
      checkInDate: formatDate(row.check_in_date),
      value: row.value,
      createdAt: formatTimestamp(row.created_at)
    }));
  }
}

function toCount(value: number | string | undefined): number {
  const count = Number(value ?? 0);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Invalid PostgreSQL participation count.");
  }
  return count;
}

function formatTimestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function formatDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}