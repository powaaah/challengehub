import type { DatabaseSync } from "node:sqlite";
import { getCuratedChallengeDefinition } from "../../domain/challenges/challenge-definition.ts";

export function ensureChallengeTypes(db: DatabaseSync) {
  const challengeColumns = listColumns(db, "challenges");
  const needsLegacyBackfill = !challengeColumns.has("challenge_type");

  addColumn(db, challengeColumns, "challenges", "challenge_type TEXT NOT NULL DEFAULT 'daily_boolean'");
  addColumn(db, challengeColumns, "challenges", "metric_unit TEXT NOT NULL DEFAULT 'completion'");
  addColumn(db, challengeColumns, "challenges", "target_value REAL NOT NULL DEFAULT 1");
  addColumn(db, challengeColumns, "challenges", "frequency TEXT NOT NULL DEFAULT 'daily'");
  addColumn(db, challengeColumns, "challenges", "measurement_direction TEXT NOT NULL DEFAULT 'at_least'");
  addColumn(db, challengeColumns, "challenges", "completion_criterion TEXT NOT NULL DEFAULT 'daily_check_in'");

  const checkInColumns = listColumns(db, "check_ins");
  addColumn(db, checkInColumns, "check_ins", "value REAL");

  if (!needsLegacyBackfill) {
    return;
  }

  const update = db.prepare(`
    UPDATE challenges
    SET challenge_type = ?, metric_unit = ?, target_value = ?, frequency = ?,
        measurement_direction = ?, completion_criterion = ?
    WHERE slug = ?
  `);
  const rows = db.prepare("SELECT slug FROM challenges").all() as Array<{ slug: string }>;

  for (const { slug } of rows) {
    const definition = getCuratedChallengeDefinition(slug);
    update.run(
      definition.type,
      definition.unit,
      definition.targetValue,
      definition.frequency,
      definition.direction,
      definition.completionCriterion,
      slug
    );
  }
}

function listColumns(db: DatabaseSync, table: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return new Set(rows.map((row) => row.name));
}

function addColumn(
  db: DatabaseSync,
  columns: Set<string>,
  table: "challenges" | "check_ins",
  definition: string
) {
  const name = definition.split(" ", 1)[0];
  if (!columns.has(name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    columns.add(name);
  }
}
