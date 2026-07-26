import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type {
  CheckInWriteRepository,
  CreateCheckInInput,
  CreateCheckInResult
} from "../../domain/participations/check-in-write-repository.ts";

type IdFactory = () => string;
type Clock = () => string;

export class SqliteCheckInWriteRepository implements CheckInWriteRepository {
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

  createForUser(input: CreateCheckInInput): CreateCheckInResult {
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO check_ins (id, participation_id, date, note, created_at)
        SELECT ?, participations.id, ?, NULL, ?
        FROM participations
        WHERE participations.id = ?
          AND participations.user_id = ?
          AND participations.status = 'active'
      `)
      .run(
        this.createId(),
        input.date,
        this.now(),
        input.participationId,
        input.userId
      );

    if (insert.changes === 1) {
      return "created";
    }

    const participation = this.db
      .prepare("SELECT id FROM participations WHERE id = ? AND user_id = ? AND status = 'active'")
      .get(input.participationId, input.userId);

    if (!participation) {
      return "participation_not_found";
    }

    return "already_exists";
  }
}