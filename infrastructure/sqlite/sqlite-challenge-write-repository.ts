import type { DatabaseSync } from "node:sqlite";
import type {
  ChallengeWriteRepository,
  CreatePendingChallengeInput,
  CreatePendingChallengeResult
} from "../../domain/challenges/challenge-write-repository.ts";

type Clock = () => string;

export class SqliteChallengeWriteRepository implements ChallengeWriteRepository {
  private readonly db: DatabaseSync;
  private readonly now: Clock;

  constructor(db: DatabaseSync, now: Clock = () => new Date().toISOString()) {
    this.db = db;
    this.now = now;
  }

  listSlugs(): string[] {
    const rows = this.db.prepare("SELECT slug FROM challenges").all() as Array<{ slug: string }>;
    return rows.map((row) => row.slug);
  }

  listPublishedChallenges() {
    return this.db
      .prepare(`
        SELECT slug, title
        FROM challenges
        WHERE visibility = 'public' AND status = 'published'
        ORDER BY title COLLATE NOCASE ASC
      `)
      .all()
      .map((row) => {
        const candidate = row as { slug: string; title: string };
        return { slug: candidate.slug, title: candidate.title };
      });
  }

  createPending(input: CreatePendingChallengeInput): CreatePendingChallengeResult {
    const now = this.now();
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO challenges (
          id, creator_id, slug, title, level, category, duration_days, goal, description,
          rules_json, tips_json, visibility, status, created_at, updated_at
        )
        SELECT ?, users.id, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 'pending', ?, ?
        FROM users
        WHERE users.id = ?
      `)
      .run(
        input.id,
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
        now,
        input.creatorId
      );

    if (insert.changes === 1) {
      return { status: "created", slug: input.slug };
    }

    const creator = this.db.prepare("SELECT 1 FROM users WHERE id = ?").get(input.creatorId);
    if (!creator) {
      return { status: "creator_not_found" };
    }

    return { status: "slug_conflict" };
  }
}