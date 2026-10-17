import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  loadChallengeFiles,
  parseChallengeMarkdown,
} from "../lib/challenge-markdown.ts";
import {
  planChallengeContent,
  syncChallengeContent,
} from "../infrastructure/sqlite/sqlite-challenge-content.ts";
import { SqliteParticipationWriteRepository } from "../infrastructure/sqlite/sqlite-participation-write-repository.ts";
import { SqliteCheckInWriteRepository } from "../infrastructure/sqlite/sqlite-check-in-write-repository.ts";
import { challenges } from "../data/challenges.ts";

const example = fs.readFileSync(
  "content/challenges/100-liegestuetze-am-stueck.md",
  "utf8",
);
function database() {
  const db = new DatabaseSync(":memory:");
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT UNIQUE,name TEXT,name_key TEXT UNIQUE,password_hash TEXT,created_at TEXT);
    CREATE TABLE challenges(id TEXT PRIMARY KEY,creator_id TEXT REFERENCES users(id),slug TEXT UNIQUE,title TEXT,level TEXT,category TEXT,duration_days INTEGER,goal TEXT,description TEXT,rules_json TEXT,tips_json TEXT,visibility TEXT,status TEXT,created_at TEXT,updated_at TEXT,challenge_type TEXT,metric_unit TEXT,target_value REAL,frequency TEXT,measurement_direction TEXT,completion_criterion TEXT);
    CREATE TABLE participations(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),challenge_id TEXT REFERENCES challenges(id),started_at TEXT,status TEXT,completed_at TEXT,UNIQUE(user_id,challenge_id));
    CREATE TABLE check_ins(id TEXT PRIMARY KEY,participation_id TEXT REFERENCES participations(id),date TEXT,value REAL,note TEXT,created_at TEXT,UNIQUE(participation_id,date));`);
  return db;
}
const catalog = () => structuredClone(challenges.slice(0, 3));
test("all Markdown files exactly match the website catalog, including headers and SEO", () => {
  assert.deepEqual(
    loadChallengeFiles(path.resolve("content/challenges")),
    challenges,
  );
  assert.ok(
    challenges.every(
      (c) => c.id && c.header.image && c.seoMarkdown.startsWith("## "),
    ),
  );
});
test("invalid metadata, malformed sections and incomplete files fail closed", () => {
  for (const bad of [
    example.replace('"targetValue": 100', '"targetValue": -1'),
    example.replace("## Regeln", "## Rulez"),
    example.replace("## SEO-Text", "## SEO"),
    example.replace('"slug":', '"broken-json"'),
    example.replace("## Tipps", "## Regeln"),
  ])
    assert.throws(() => parseChallengeMarkdown(bad, "broken.md"));
});
test("renaming a file preserves ID; duplicate and missing input directories cannot erase catalog", () => {
  const dir = fs.mkdtempSync(
    path.join(os.tmpdir(), "challenge-markdown-test-"),
  );
  try {
    fs.writeFileSync(path.join(dir, "first.md"), example);
    const id = loadChallengeFiles(dir)[0].id;
    fs.renameSync(path.join(dir, "first.md"), path.join(dir, "renamed.md"));
    assert.equal(loadChallengeFiles(dir)[0].id, id);
    fs.writeFileSync(path.join(dir, "duplicate.md"), example);
    assert.throws(() => loadChallengeFiles(dir), /Doppelter/);
    fs.unlinkSync(path.join(dir, "duplicate.md"));
    fs.unlinkSync(path.join(dir, "renamed.md"));
    assert.throws(() => loadChallengeFiles(dir), /Keine Challenge/);
    assert.throws(() => loadChallengeFiles(path.join(dir, "missing")), /fehlt/);
  } finally {
    for (const name of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, name));
    fs.rmdirSync(dir);
  }
});
test("preview is read-only; sync adds, edits and versions idempotently without duplicate records", () => {
  const db = database(),
    files = catalog();
  assert.equal(planChallengeContent(db, files).created.length, 3);
  assert.equal(
    db
      .prepare(
        "SELECT COUNT(*) n FROM sqlite_master WHERE name='challenge_content_sources'",
      )
      .get()!.n,
    0,
  );
  syncChallengeContent(db, files);
  syncChallengeContent(db, files);
  assert.equal(
    db.prepare("SELECT COUNT(*) n FROM challenge_content_versions").get()!.n,
    3,
  );
  files[0].title = "Edited title";
  files[0].seoMarkdown = "## Edited SEO\n\nA new paragraph.";
  assert.deepEqual(syncChallengeContent(db, files).updated, [files[0].id]);
  assert.equal(
    db.prepare("SELECT title FROM challenges WHERE id=?").get(files[0].id)!
      .title,
    "Edited title",
  );
  assert.equal(
    db
      .prepare(
        "SELECT COUNT(*) n FROM challenge_content_versions WHERE content_id=?",
      )
      .get(files[0].id)!.n,
    2,
  );
  assert.equal(db.prepare("SELECT COUNT(*) n FROM challenges").get()!.n, 3);
  db.close();
});
test("removal archives existing results, blocks writes and joins, restoring file restores original state", () => {
  const db = database(),
    files = catalog();
  syncChallengeContent(db, files);
  db.exec(
    "INSERT INTO users VALUES('u','u@test','Test','test','disabled','now'); INSERT INTO users VALUES('v','v@test','Other','other','disabled','now');",
  );
  const repo = new SqliteParticipationWriteRepository(
    db,
    () => "p",
    () => "2026-01-01",
  );
  assert.equal(
    repo.startForUser({ userId: "u", challengeId: files[1].id }).status,
    "created",
  );
  db.exec("INSERT INTO check_ins VALUES('i','p','2026-01-01',NULL,NULL,'now')");
  assert.deepEqual(syncChallengeContent(db, [files[0], files[2]]).archived, [
    files[1].id,
  ]);
  assert.equal(
    db.prepare("SELECT status FROM participations WHERE id='p'").get()!.status,
    "archived",
  );
  assert.equal(
    repo.startForUser({ userId: "v", challengeId: files[1].id }).status,
    "challenge_not_available",
  );
  assert.equal(
    new SqliteCheckInWriteRepository(db).createForUser({
      participationId: "p",
      userId: "u",
      date: "2026-01-02",
    }),
    "participation_not_found",
  );
  assert.equal(db.prepare("SELECT COUNT(*) n FROM check_ins").get()!.n, 1);
  syncChallengeContent(db, files);
  assert.equal(
    db.prepare("SELECT status FROM participations WHERE id='p'").get()!.status,
    "active",
  );
  db.close();
});
test("rule changes with existing participation and slug collisions roll back the entire batch", () => {
  const db = database(),
    files = catalog();
  syncChallengeContent(db, files);
  db.exec(
    "INSERT INTO users VALUES('u','u@test','Test','test','disabled','now')",
  );
  new SqliteParticipationWriteRepository(
    db,
    () => "p",
    () => "2026-01-01",
  ).startForUser({ userId: "u", challengeId: files[1].id });
  files[0].title = "Must not persist";
  files[1].rules.push("Changed scoring rule");
  assert.throws(() => syncChallengeContent(db, files), /Neue Ausgabe/);
  assert.notEqual(
    db.prepare("SELECT title FROM challenges WHERE id=?").get(files[0].id)!
      .title,
    files[0].title,
  );
  assert.throws(() => syncChallengeContent(db, []), /Leerer Katalog/);
  const changedDuration = catalog();
  changedDuration[1].duration = "200 Tage";
  assert.throws(() => syncChallengeContent(db, changedDuration), /Neue Ausgabe/);
  const collision = catalog();
  collision[0].id = "curated:other";
  assert.throws(() => syncChallengeContent(db, collision), /bereits/);
  db.close();
});
