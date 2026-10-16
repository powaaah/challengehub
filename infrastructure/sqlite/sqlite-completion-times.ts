import type { DatabaseSync } from "node:sqlite";

export function ensureCompletionTimes(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS challenge_completion_times (
    participation_id TEXT PRIMARY KEY REFERENCES participations(id) ON DELETE CASCADE,
    seconds REAL NOT NULL CHECK (seconds >= 1 AND seconds <= 604800),
    updated_at TEXT NOT NULL
  )`);
}

export function recordCompletionTime(
  db: DatabaseSync,
  input: {
    participationId: string;
    userId: string;
    seconds: number;
  },
) {
  if (
    !Number.isFinite(input.seconds) ||
    input.seconds < 1 ||
    input.seconds > 604800
  )
    return false;
  const result = db
    .prepare(
      `
    INSERT INTO challenge_completion_times (participation_id, seconds, updated_at)
    SELECT p.id, ?, ? FROM participations p JOIN challenges c ON c.id = p.challenge_id
    WHERE p.id = ? AND p.user_id = ? AND p.status = 'completed'
      AND c.challenge_type = 'one_time_result' AND c.metric_unit NOT IN ('seconds', 'minutes')
    ON CONFLICT(participation_id) DO UPDATE SET seconds = excluded.seconds, updated_at = excluded.updated_at
      WHERE excluded.seconds < challenge_completion_times.seconds
  `,
    )
    .run(
      input.seconds,
      new Date().toISOString(),
      input.participationId,
      input.userId,
    );
  return result.changes === 1;
}
