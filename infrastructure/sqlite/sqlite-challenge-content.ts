import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { FileChallenge } from "../../lib/challenge-markdown.ts";
import { SqliteCuratedChallengeBootstrapRepository } from "./sqlite-curated-challenge-bootstrap-repository.ts";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
const digest = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");
export type ContentPlan = {
  created: string[];
  updated: string[];
  restored: string[];
  archived: string[];
  unchanged: string[];
  blocked: string[];
};
type Source = {
  content_id: string;
  challenge_id: string;
  slug: string;
  content_hash: string;
  revision: number;
  archived: number;
};
type Existing = {
  id: string;
  slug: string;
  rules_json: string;
  challenge_type: string;
  metric_unit: string;
  target_value: number;
  frequency: string;
  measurement_direction: string;
  completion_criterion: string;
  status: string;
};
function exists(db: DatabaseSync, table: string) {
  return !!db
    .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?")
    .get(table);
}
function sources(db: DatabaseSync): Source[] {
  return exists(db, "challenge_content_sources")
    ? (db
        .prepare("SELECT * FROM challenge_content_sources")
        .all() as unknown as Source[])
    : [];
}
function existing(db: DatabaseSync): Existing[] {
  return exists(db, "challenges")
    ? (db.prepare("SELECT * FROM challenges").all() as unknown as Existing[])
    : [];
}
export function planChallengeContent(
  db: DatabaseSync,
  catalog: FileChallenge[],
): ContentPlan {
  const plan: ContentPlan = {
    created: [],
    updated: [],
    restored: [],
    archived: [],
    unchanged: [],
    blocked: [],
  };
  if (!catalog.length) throw new Error("Leerer Katalog: Abgleich abgebrochen.");
  if (
    new Set(catalog.map((c) => c.id)).size !== catalog.length ||
    new Set(catalog.map((c) => c.slug)).size !== catalog.length
  )
    throw new Error("Doppelte IDs oder Slugs.");
  const managed = sources(db),
    rows = existing(db),
    ids = new Set(catalog.map((c) => c.id));
  for (const c of catalog) {
    const source = managed.find((s) => s.content_id === c.id);
    const row = rows.find((r) => r.id === (source?.challenge_id ?? c.id));
    const collision = rows.find((r) => r.slug === c.slug && r.id !== row?.id);
    if (collision) {
      plan.blocked.push(
        `${c.id}: Slug ${c.slug} gehört bereits zu einer anderen Challenge.`,
      );
      continue;
    }
    if (row && row.slug !== c.slug) {
      plan.blocked.push(
        `${c.id}: Slug ist dauerhaft. Dateiname und Titel dürfen geändert werden.`,
      );
      continue;
    }
    if (row) {
      const definition = {
        type: row.challenge_type,
        unit: row.metric_unit,
        targetValue: row.target_value,
        frequency: row.frequency,
        direction: row.measurement_direction,
        completionCriterion: row.completion_criterion,
      };
      const previous =
        source && source.revision > 0
          ? (db
              .prepare(
                "SELECT content_json FROM challenge_content_versions WHERE content_id=? AND revision=?",
              )
              .get(c.id, source.revision) as
              | { content_json: string }
              | undefined)
          : undefined;
      const changedRules =
        canonical(JSON.parse(row.rules_json)) !== canonical(c.rules) ||
        canonical(definition) !== canonical(c.definition) ||
        (previous && JSON.parse(previous.content_json).duration !== c.duration);
      const count = db
        .prepare("SELECT COUNT(*) n FROM participations WHERE challenge_id=?")
        .get(row.id) as { n: number };
      if (changedRules && count.n) {
        plan.blocked.push(
          `${c.id}: Wertung/Regeln haben bereits Teilnahmen. Neue Ausgabe mit neuer ID und neuem Slug anlegen.`,
        );
        continue;
      }
    }
    if (source?.archived) plan.restored.push(c.id);
    else if (!source) plan.created.push(c.id);
    else if (source.content_hash !== digest(c)) plan.updated.push(c.id);
    else plan.unchanged.push(c.id);
  }
  const removed = new Set(
    managed
      .filter((s) => !s.archived && !ids.has(s.content_id))
      .map((s) => s.content_id),
  );
  for (const row of rows)
    if (
      row.id.startsWith("curated:") &&
      !ids.has(row.id) &&
      !managed.some((s) => s.challenge_id === row.id) &&
      row.status !== "archived"
    )
      removed.add(row.id);
  plan.archived = [...removed].sort();
  return plan;
}
export function syncChallengeContent(
  db: DatabaseSync,
  catalog: FileChallenge[],
  now = new Date().toISOString(),
): ContentPlan {
  db.exec("BEGIN IMMEDIATE");
  try {
    const plan = planChallengeContent(db, catalog);
    if (plan.blocked.length) throw new Error(plan.blocked.join("\n"));
    db.exec(`CREATE TABLE IF NOT EXISTS challenge_content_sources (
      content_id TEXT PRIMARY KEY,challenge_id TEXT NOT NULL UNIQUE REFERENCES challenges(id),slug TEXT NOT NULL,
      content_hash TEXT NOT NULL,revision INTEGER NOT NULL,archived INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS challenge_content_versions (
      content_id TEXT NOT NULL,revision INTEGER NOT NULL,content_json TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(content_id,revision));
      CREATE TABLE IF NOT EXISTS challenge_content_archives (
      participation_id TEXT PRIMARY KEY REFERENCES participations(id) ON DELETE CASCADE,previous_status TEXT NOT NULL);`);
    const bootstrap = new SqliteCuratedChallengeBootstrapRepository(
      db,
      () => now,
    );
    for (const c of catalog) {
      if (plan.unchanged.includes(c.id)) continue;
      const source = sources(db).find((s) => s.content_id === c.id);
      bootstrap.ensureChallenge({ ...c, id: c.id });
      const d = c.definition;
      db.prepare(
        `UPDATE challenges SET title=?,level=?,goal=?,description=?,rules_json=?,tips_json=?,duration_days=?,
        challenge_type=?,metric_unit=?,target_value=?,frequency=?,measurement_direction=?,completion_criterion=?,
        visibility='internal',status='published',updated_at=? WHERE id=?`,
      ).run(
        c.title,
        c.level,
        c.goal,
        c.description,
        JSON.stringify(c.rules),
        JSON.stringify(c.tips),
        Number(c.duration.match(/^([0-9]+) Tage$/)?.[1] ?? 0),
        d.type,
        d.unit,
        d.targetValue,
        d.frequency,
        d.direction,
        d.completionCriterion,
        now,
        c.id,
      );
      const revision = (source?.revision ?? 0) + 1;
      db.prepare("INSERT INTO challenge_content_versions VALUES (?,?,?,?)").run(
        c.id,
        revision,
        JSON.stringify(c),
        now,
      );
      db.prepare(
        `INSERT INTO challenge_content_sources VALUES (?,?,?,?,?,0) ON CONFLICT(content_id) DO UPDATE SET content_hash=excluded.content_hash,revision=excluded.revision,archived=0`,
      ).run(c.id, c.id, c.slug, digest(c), revision);
      if (source?.archived) {
        db.prepare(
          `UPDATE participations SET status=(SELECT previous_status FROM challenge_content_archives a WHERE a.participation_id=participations.id)
          WHERE challenge_id=? AND status='archived' AND id IN (SELECT participation_id FROM challenge_content_archives)`,
        ).run(c.id);
        db.prepare(
          "DELETE FROM challenge_content_archives WHERE participation_id IN (SELECT id FROM participations WHERE challenge_id=?)",
        ).run(c.id);
      }
    }
    for (const id of plan.archived) {
      db.prepare(
        `INSERT OR IGNORE INTO challenge_content_archives SELECT id,status FROM participations WHERE challenge_id=? AND status IN ('active','completed')`,
      ).run(id);
      db.prepare(
        "UPDATE participations SET status='archived' WHERE challenge_id=? AND status IN ('active','completed')",
      ).run(id);
      db.prepare(
        "UPDATE challenges SET status='archived',updated_at=? WHERE id=?",
      ).run(now, id);
      const row = db
        .prepare("SELECT slug FROM challenges WHERE id=?")
        .get(id) as { slug: string };
      db.prepare(
        `INSERT INTO challenge_content_sources VALUES (?,?,?,'',0,1) ON CONFLICT(content_id) DO UPDATE SET archived=1`,
      ).run(id, id, row.slug);
    }
    db.exec("COMMIT");
    return plan;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
