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
    const participation = this.db
      .prepare(`
        SELECT
          challenges.challenge_type AS challengeType,
          challenges.target_value AS targetValue,
          challenges.measurement_direction AS direction,
          challenges.completion_criterion AS completionCriterion
        FROM participations
        JOIN challenges ON challenges.id = participations.challenge_id
        WHERE participations.id = ?
          AND participations.user_id = ?
          AND participations.status = 'active'
      `)
      .get(input.participationId, input.userId) as {
        challengeType: string;
        targetValue: number;
        direction: "at_least" | "at_most";
        completionCriterion: string;
      } | undefined;

    if (!participation) {
      return "participation_not_found";
    }

    const isMetricChallenge = participation.challengeType !== "daily_boolean";
    if (
      (isMetricChallenge && !isPositiveFiniteNumber(input.value)) ||
      (!isMetricChallenge && input.value !== undefined)
    ) {
      return "invalid_value";
    }

    const now = this.now();
    const insert = this.db
      .prepare(`
        INSERT OR IGNORE INTO check_ins (id, participation_id, date, value, note, created_at)
        SELECT ?, participations.id, ?, ?, NULL, ?
        FROM participations
        WHERE participations.id = ?
          AND participations.user_id = ?
          AND participations.status = 'active'
      `)
      .run(
        this.createId(),
        input.date,
        input.value ?? null,
        now,
        input.participationId,
        input.userId
      );

    if (insert.changes === 1) {
      if (hasReachedCompletion(this.db, input.participationId, participation)) {
        this.db.prepare(`
          UPDATE participations
          SET status = 'completed', completed_at = ?
          WHERE id = ? AND status = 'active'
        `).run(now, input.participationId);
      }
      return "created";
    }

    const activeParticipation = this.db
      .prepare("SELECT id FROM participations WHERE id = ? AND user_id = ? AND status = 'active'")
      .get(input.participationId, input.userId);

    if (!activeParticipation) {
      return "participation_not_found";
    }

    return "already_exists";
  }
}

function hasReachedCompletion(
  db: DatabaseSync,
  participationId: string,
  definition: {
    targetValue: number;
    direction: "at_least" | "at_most";
    completionCriterion: string;
  }
) {
  if (definition.completionCriterion === "daily_check_in") {
    return false;
  }
  const aggregate = definition.completionCriterion === "cumulative_target"
    ? "SUM(value)"
    : definition.direction === "at_most" ? "MIN(value)" : "MAX(value)";
  const row = db.prepare(`
    SELECT ${aggregate} AS value
    FROM check_ins
    WHERE participation_id = ? AND value IS NOT NULL
  `).get(participationId) as { value: number | null };
  if (row.value === null) {
    return false;
  }
  return definition.direction === "at_least"
    ? row.value >= definition.targetValue
    : row.value <= definition.targetValue;
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
