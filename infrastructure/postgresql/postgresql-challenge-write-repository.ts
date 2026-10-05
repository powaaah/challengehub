import type {
  ChallengeCreationCandidate,
  ChallengeWriteRepository,
  CreatePendingChallengeInput,
  CreatePendingChallengeResult
} from "../../domain/challenges/challenge-write-repository.ts";
import type { PostgresQueryClient } from "./postgres-query-client.ts";

type Clock = () => string;

export class PostgresqlChallengeWriteRepository implements ChallengeWriteRepository {
  private readonly client: PostgresQueryClient;
  private readonly now: Clock;

  constructor(client: PostgresQueryClient, now: Clock = () => new Date().toISOString()) {
    this.client = client;
    this.now = now;
  }

  async listSlugs(): Promise<string[]> {
    const result = await this.client.query(
      `SELECT slug
       FROM challenges
       ORDER BY slug ASC`
    );
    return result.rows.map((row) => String((row as { slug: unknown }).slug));
  }

  async listPublishedChallenges(): Promise<ChallengeCreationCandidate[]> {
    const result = await this.client.query(
      `SELECT slug, title
       FROM challenges
       WHERE visibility = 'public' AND status = 'published'
       ORDER BY lower(title) ASC, slug ASC`
    );
    return result.rows.map((row) => {
      const candidate = row as { slug: unknown; title: unknown };
      return { slug: String(candidate.slug), title: String(candidate.title) };
    });
  }

  async createPending(input: CreatePendingChallengeInput): Promise<CreatePendingChallengeResult> {
    const now = this.now();
    const result = await this.client.query(
      `INSERT INTO challenges (
         id, creator_id, slug, title, level, category, duration_days, goal, description,
         rules_json, tips_json, visibility, status, created_at, updated_at,
         challenge_type, metric_unit, target_value, frequency, measurement_direction,
         completion_criterion
       )
       SELECT
         $1, users.id, $3, $4, $5, $6, $7, $8, $9,
         $10::jsonb, $11::jsonb, 'public', 'pending', $12::timestamptz, $12::timestamptz,
         $13, $14, $15, $16, $17, $18
       FROM users
       WHERE users.id = $2
       ON CONFLICT DO NOTHING
       RETURNING slug`,
      [
        input.id,
        input.creatorId,
        input.slug,
        input.title,
        input.level,
        input.category,
        input.durationDays,
        input.goal,
        input.description,
        JSON.stringify(input.rules),
        JSON.stringify(input.tips),
        now,
        input.definition.type,
        input.definition.unit,
        input.definition.targetValue,
        input.definition.frequency,
        input.definition.direction,
        input.definition.completionCriterion
      ]
    );

    if (result.rows.length === 1) {
      return { status: "created", slug: input.slug };
    }

    const creator = await this.client.query(
      `SELECT 1 AS found
       FROM users
       WHERE id = $1`,
      [input.creatorId]
    );
    return { status: creator.rows.length === 0 ? "creator_not_found" : "slug_conflict" };
  }
}
