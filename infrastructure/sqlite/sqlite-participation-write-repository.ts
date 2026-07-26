import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type {
  LeaveParticipationInput,
  LeaveParticipationResult,
  ParticipationWriteRepository,
  StartParticipationInput,
  StartParticipationResult
} from "../../domain/participations/participation-write-repository.ts";

type IdFactory = () => string;
type Clock = () => string;

export class SqliteParticipationWriteRepository implements ParticipationWriteRepository {
  private readonly db: DatabaseSync;
  private readonly createId: IdFactory;
  private readonly now: Clock;

  constructor(
    db: DatabaseSync,
    createId: IdFactory = randomUUID,
    now: Clock = () => new Date().toISOString()
  ) {
    this.db = db;
    this.createId = createId;
    this.now = now;
  }

  startForUser(input: StartParticipationInput): StartParticipationResult {
    const participationId = this.createId();
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO participations (
          id, user_id, challenge_id, started_at, status, completed_at
        )
        SELECT ?, users.id, challenges.id, ?, 'active', NULL
        FROM challenges
        JOIN users ON users.id = ?
        WHERE challenges.id = ? AND challenges.status = 'published'
      `)
      .run(participationId, this.now(), input.userId, input.challengeId);

    if (insert.changes === 1) {
      return { status: "created", participationId };
    }

    const existing = this.db
      .prepare(`
        SELECT id
        FROM participations
        WHERE user_id = ? AND challenge_id = ?
      `)
      .get(input.userId, input.challengeId) as { id: string } | undefined;

    if (existing) {
      return {
        status: "already_exists",
        participationId: existing.id
      };
    }

    return { status: "challenge_not_available" };
  }

  leaveForUser(input: LeaveParticipationInput): LeaveParticipationResult {
    const result = this.db
      .prepare(`
        UPDATE participations
        SET status = 'cancelled', completed_at = ?
        WHERE id = ? AND user_id = ? AND status = 'active'
      `)
      .run(this.now(), input.participationId, input.userId);

    if (result.changes === 1) {
      return { status: "left" };
    }

    const existing = this.db
      .prepare("SELECT 1 FROM participations WHERE id = ? AND user_id = ?")
      .get(input.participationId, input.userId);

    return { status: existing ? "already_inactive" : "not_found" };
  }
}