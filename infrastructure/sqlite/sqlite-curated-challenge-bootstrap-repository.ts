import type { DatabaseSync } from "node:sqlite";
import type {
  CuratedChallengeBootstrapInput,
  CuratedChallengeBootstrapRepository
} from "../../domain/challenges/curated-challenge-bootstrap-repository.ts";

type Clock = () => string;

const SYSTEM_USER_ID = "system";

export class SqliteCuratedChallengeBootstrapRepository
  implements CuratedChallengeBootstrapRepository
{
  private readonly db: DatabaseSync;
  private readonly now: Clock;

  constructor(db: DatabaseSync, now: Clock = () => new Date().toISOString()) {
    this.db = db;
    this.now = now;
  }

  ensureChallenge(input: CuratedChallengeBootstrapInput): string {
    const existing = this.findChallengeId(input.slug);
    if (existing) {
      return existing;
    }

    const now = this.now();
    this.db
      .prepare(`
        INSERT OR IGNORE INTO users (id, email, name, password_hash, created_at)
        VALUES (?, ?, 'ChallengeHub', 'disabled:disabled', ?)
      `)
      .run(SYSTEM_USER_ID, "system@challengehub.local", now);

    this.db
      .prepare(`
        INSERT OR IGNORE INTO challenges (
          id, creator_id, slug, title, level, category, duration_days, goal, description,
          rules_json, tips_json, visibility, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, 'Kuratierte Challenge', 0, ?, ?, ?, ?, 'internal', 'published', ?, ?)
      `)
      .run(
        input.id,
        SYSTEM_USER_ID,
        input.slug,
        input.title,
        input.level,
        input.goal,
        input.description,
        JSON.stringify(input.rules),
        JSON.stringify(input.tips),
        now,
        now
      );

    const challengeId = this.findChallengeId(input.slug);
    if (!challengeId) {
      throw new Error("Curated challenge could not be materialized.");
    }

    return challengeId;
  }

  private findChallengeId(slug: string) {
    const row = this.db.prepare("SELECT id FROM challenges WHERE slug = ?").get(slug) as
      | { id: string }
      | undefined;
    return row?.id ?? null;
  }
}