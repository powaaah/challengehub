import { SYSTEM_ACCOUNT_NAME_KEY } from "../../domain/accounts/username.ts";
import type {
  CuratedChallengeBootstrapInput,
  CuratedChallengeBootstrapRepository
} from "../../domain/challenges/curated-challenge-bootstrap-repository.ts";
import type {
  PostgresQueryClient,
  PostgresTransactionalQueryClient
} from "./postgres-query-client.ts";

type Clock = () => string;

const SYSTEM_USER_ID = "system";

export class PostgresqlCuratedChallengeBootstrapRepository
  implements CuratedChallengeBootstrapRepository {
  private readonly client: PostgresTransactionalQueryClient;
  private readonly now: Clock;

  constructor(
    client: PostgresTransactionalQueryClient,
    now: Clock = () => new Date().toISOString()
  ) {
    this.client = client;
    this.now = now;
  }

  async ensureChallenge(input: CuratedChallengeBootstrapInput): Promise<string> {
    return this.client.transaction(async (client) => {
      const existing = await findChallengeId(client, input.slug);
      if (existing) return existing;

      const now = this.now();
      await client.query(
        `INSERT INTO users (
           id, email, name, name_key, password_hash, created_at, email_verified_at
         )
         VALUES ('system', 'system@challengehub.local', 'ChallengeHub', $1,
           'disabled:disabled', $2::timestamptz, $2::timestamptz)
         ON CONFLICT DO NOTHING`,
        [SYSTEM_ACCOUNT_NAME_KEY, now]
      );

      const inserted = await client.query(
        `INSERT INTO challenges (
           id, creator_id, slug, title, level, category, duration_days, goal, description,
           rules_json, tips_json, visibility, status, created_at, updated_at,
           challenge_type, metric_unit, target_value, frequency, measurement_direction,
           completion_criterion
         )
         VALUES (
           $1, $2, $3, $4, $5, 'Kuratierte Challenge', 0, $6, $7,
           $8::jsonb, $9::jsonb, 'internal', 'published', $10::timestamptz,
           $10::timestamptz, $11, $12, $13, $14, $15, $16
         )
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          input.id, SYSTEM_USER_ID, input.slug, input.title, input.level,
          input.goal, input.description, JSON.stringify(input.rules), JSON.stringify(input.tips), now,
          input.definition.type, input.definition.unit, input.definition.targetValue,
          input.definition.frequency, input.definition.direction,
          input.definition.completionCriterion
        ]
      );
      const insertedId = (inserted.rows[0] as { id?: unknown } | undefined)?.id;
      if (typeof insertedId === "string") return insertedId;

      const challengeId = await findChallengeId(client, input.slug);
      if (!challengeId) throw new Error("Curated challenge could not be materialized.");
      return challengeId;
    });
  }
}

async function findChallengeId(client: PostgresQueryClient, slug: string) {
  const result = await client.query(
    "SELECT id FROM challenges WHERE slug = $1 LIMIT 1",
    [slug]
  );
  const id = (result.rows[0] as { id?: unknown } | undefined)?.id;
  return typeof id === "string" ? id : null;
}
