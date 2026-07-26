import type { ChallengeLevel } from "../../data/challenges.ts";
import type {
  PublicChallenge,
  PublicChallengeRepository
} from "../../domain/challenges/public-challenge.ts";

export interface PostgresQueryClient {
  query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
}

type PostgresPublicChallengeRow = {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  duration_days: number;
  goal: string;
  description: string;
  rules_json: unknown;
  tips_json: unknown;
  created_at: Date | string;
  creator_name: string;
};

const publishedChallengeSelect = `
  SELECT
    challenges.id,
    challenges.creator_id,
    challenges.slug,
    challenges.title,
    challenges.level,
    challenges.category,
    challenges.duration_days,
    challenges.goal,
    challenges.description,
    challenges.rules_json,
    challenges.tips_json,
    challenges.created_at,
    users.name AS creator_name
  FROM challenges
  JOIN users ON users.id = challenges.creator_id
  WHERE challenges.visibility = 'public'
    AND challenges.status = 'published'`;

export class PostgresqlPublicChallengeRepository implements PublicChallengeRepository {
  private readonly client: PostgresQueryClient;

  constructor(client: PostgresQueryClient) {
    this.client = client;
  }

  async listPublished(): Promise<PublicChallenge[]> {
    const result = await this.client.query(
      `${publishedChallengeSelect}\n  ORDER BY challenges.created_at DESC`
    );

    return (result.rows as PostgresPublicChallengeRow[]).map(mapPublicChallengeRow);
  }

  async findPublishedBySlug(slug: string): Promise<PublicChallenge | null> {
    const result = await this.client.query(
      `${publishedChallengeSelect}\n    AND challenges.slug = $1\n  LIMIT 1`,
      [slug]
    );
    const row = result.rows[0] as PostgresPublicChallengeRow | undefined;

    return row ? mapPublicChallengeRow(row) : null;
  }
}

function mapPublicChallengeRow(challenge: PostgresPublicChallengeRow): PublicChallenge {
  return {
    id: challenge.id,
    creatorId: challenge.creator_id,
    slug: challenge.slug,
    title: challenge.title,
    level: challenge.level,
    category: challenge.category,
    durationDays: challenge.duration_days,
    goal: challenge.goal,
    description: challenge.description,
    rules: parseList(challenge.rules_json),
    tips: parseList(challenge.tips_json),
    createdAt:
      challenge.created_at instanceof Date
        ? challenge.created_at.toISOString()
        : challenge.created_at,
    creatorName: challenge.creator_name
  };
}

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}