import type { DatabaseSync } from "node:sqlite";
import {
  BODY_SLUG,
  emptyBodyState,
  type BodyState,
} from "../../domain/challenges/navy.ts";

export function ensureBodyTransformation(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS body_transformation (
    participation_id TEXT PRIMARY KEY REFERENCES participations(id) ON DELETE CASCADE,
    state_json TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS body_transformation_photos (
    participation_id TEXT NOT NULL REFERENCES participations(id) ON DELETE CASCADE,
    slot TEXT NOT NULL CHECK(slot IN ('start','end')), image BLOB NOT NULL, updated_at TEXT NOT NULL,
    PRIMARY KEY(participation_id,slot));`);
}
export function ownsBody(db: DatabaseSync, id: string, userId: string) {
  return db
    .prepare(
      `SELECT p.started_at AS startedAt, p.status FROM participations p JOIN challenges c ON c.id=p.challenge_id
    WHERE p.id=? AND p.user_id=? AND c.slug=?`,
    )
    .get(id, userId, BODY_SLUG) as
    | { startedAt: string; status: string }
    | undefined;
}
export function readBody(db: DatabaseSync, id: string): BodyState {
  const row = db
    .prepare(
      "SELECT state_json FROM body_transformation WHERE participation_id=?",
    )
    .get(id) as { state_json: string } | undefined;
  return row ? JSON.parse(row.state_json) : emptyBodyState();
}
export function writeBody(db: DatabaseSync, id: string, state: BodyState) {
  db.prepare(
    `INSERT INTO body_transformation VALUES (?,?,?) ON CONFLICT(participation_id)
    DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at`,
  ).run(id, JSON.stringify(state), new Date().toISOString());
}
