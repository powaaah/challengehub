import * as assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { SqliteCuratedChallengeBootstrapRepository } from "../infrastructure/sqlite/sqlite-curated-challenge-bootstrap-repository.ts";

function createRepository() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE challenges (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL REFERENCES users(id),
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      goal TEXT NOT NULL,
      description TEXT NOT NULL,
      rules_json TEXT NOT NULL,
      tips_json TEXT NOT NULL,
      visibility TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  const repository = new SqliteCuratedChallengeBootstrapRepository(
    db,
    () => "2026-07-15T08:00:00.000Z"
  );
  return { db, repository };
}

const challenge = {
  id: "curated:10000-schritte-am-tag",
  slug: "10000-schritte-am-tag",
  title: "10 000 Schritte am Tag Challenge",
  level: "Beginner",
  goal: "Gehe jeden Tag 10 000 Schritte.",
  description: "Eine einfache Dauer-Challenge.",
  rules: ["Taeglich 10 000 Schritte gehen."],
  tips: ["Plane feste Gehzeiten ein."]
};

test("Bootstrap-Repository materialisiert Systemnutzer und kuratierte Challenge idempotent", () => {
  const { db, repository } = createRepository();

  assert.equal(repository.ensureChallenge(challenge), challenge.id);
  assert.equal(repository.ensureChallenge(challenge), challenge.id);

  assert.deepEqual(
    { ...db.prepare("SELECT id, email, name FROM users").get() },
    { id: "system", email: "system@challengehub.local", name: "ChallengeHub" }
  );
  assert.deepEqual(
    {
      ...db
        .prepare(`
          SELECT id, creator_id as creatorId, slug, category, duration_days as durationDays,
                 visibility, status, rules_json as rulesJson, tips_json as tipsJson
          FROM challenges
        `)
        .get()
    },
    {
      id: challenge.id,
      creatorId: "system",
      slug: challenge.slug,
      category: "Kuratierte Challenge",
      durationDays: 0,
      visibility: "internal",
      status: "published",
      rulesJson: JSON.stringify(challenge.rules),
      tipsJson: JSON.stringify(challenge.tips)
    }
  );
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM challenges").get()?.count, 1);
  db.close();
});

test("Bootstrap-Repository respektiert eine bereits vorhandene Challenge mit gleichem Slug", () => {
  const { db, repository } = createRepository();
  db.exec(`
    INSERT INTO users VALUES ('u1', 'user@example.test', 'User', 'hash', '2026-01-01T00:00:00.000Z');
    INSERT INTO challenges VALUES (
      'existing', 'u1', '10000-schritte-am-tag', 'Bestehend', 'Beginner', 'Community', 30,
      'Ziel', 'Beschreibung', '[]', '[]', 'public', 'published',
      '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
    );
  `);

  assert.equal(repository.ensureChallenge(challenge), "existing");
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM challenges").get()?.count, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS count FROM users").get()?.count, 1);
  db.close();
});