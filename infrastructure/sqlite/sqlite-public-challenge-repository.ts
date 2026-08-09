import type { DatabaseSync } from "node:sqlite";
import type { ChallengeLevel } from "../../data/challenges.ts";
import type {
  PublicChallenge,
  PublicChallengeRepository
} from "../../domain/challenges/public-challenge.ts";
import { parseChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";

type PublicChallengeRow = {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  duration_days: number;
  goal: string;
  description: string;
  rules_json: string;
  tips_json: string;
  created_at: string;
  creator_name: string;
  challenge_type: string;
  metric_unit: string;
  target_value: number;
  frequency: string;
  measurement_direction: string;
  completion_criterion: string;
};

export class SqlitePublicChallengeRepository implements PublicChallengeRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  async listPublished(): Promise<PublicChallenge[]> {
    const rows = this.db
      .prepare(
        `SELECT challenges.*, users.name as creator_name
         FROM challenges
         JOIN users ON users.id = challenges.creator_id
         WHERE challenges.visibility = 'public' AND challenges.status = 'published'
         ORDER BY challenges.created_at DESC`
      )
      .all() as unknown as PublicChallengeRow[];

    return rows.map(mapPublicChallengeRow);
  }

  async findPublishedBySlug(slug: string): Promise<PublicChallenge | null> {
    const row = this.db
      .prepare(
        `SELECT challenges.*, users.name as creator_name
         FROM challenges
         JOIN users ON users.id = challenges.creator_id
         WHERE challenges.slug = ?
           AND challenges.visibility = 'public'
           AND challenges.status = 'published'`
      )
      .get(slug) as unknown as PublicChallengeRow | undefined;

    return row ? mapPublicChallengeRow(row) : null;
  }
}

function mapPublicChallengeRow(challenge: PublicChallengeRow): PublicChallenge {
  const definition = parseChallengeDefinition({
    type: challenge.challenge_type,
    unit: challenge.metric_unit,
    targetValue: challenge.target_value,
    frequency: challenge.frequency,
    direction: challenge.measurement_direction,
    completionCriterion: challenge.completion_criterion
  });
  if (!definition) {
    throw new Error(`Invalid challenge definition for ${challenge.slug}.`);
  }

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
    createdAt: challenge.created_at,
    creatorName: challenge.creator_name,
    definition
  };
}

function parseList(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
