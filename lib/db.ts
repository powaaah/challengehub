import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { getChallengeBySlug } from "@/data/challenges";
import type { ChallengeLevel } from "@/data/challenges";

const globalForDb = globalThis as unknown as {
  challengeHubDb?: DatabaseSync;
};

export type DbUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type DbPublicChallenge = {
  id: string;
  creatorId: string;
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  durationDays: number;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
  createdAt: string;
  creatorName: string;
};

export type DbParticipation = {
  id: string;
  userId: string;
  challengeId: string;
  challengeSlug: string;
  challengeTitle: string;
  challengeGoal: string;
  startedAt: string;
  status: string;
  completedAt: string | null;
};

export function getDb() {
  if (globalForDb.challengeHubDb) {
    return globalForDb.challengeHubDb;
  }

  const dbPath = process.env.CHALLENGEHUB_DB_PATH ?? path.join(process.cwd(), ".data", "challengehub.sqlite");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      level TEXT NOT NULL,
      category TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      goal TEXT NOT NULL,
      description TEXT NOT NULL,
      rules_json TEXT NOT NULL,
      tips_json TEXT NOT NULL,
      visibility TEXT NOT NULL DEFAULT 'public',
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
      UNIQUE (user_id, challenge_id)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      participation_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (participation_id) REFERENCES participations(id) ON DELETE CASCADE,
      UNIQUE (participation_id, date)
    );
  `);

  globalForDb.challengeHubDb = db;
  return db;
}

export function findUserByEmail(email: string) {
  return getDb()
    .prepare("SELECT id, email, name, password_hash as passwordHash, created_at as createdAt FROM users WHERE email = ?")
    .get(email.toLowerCase()) as DbUser | undefined;
}

export function findUserBySessionTokenHash(tokenHash: string) {
  return getDb()
    .prepare(
      `
      SELECT users.id, users.email, users.name, users.password_hash as passwordHash, users.created_at as createdAt
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `
    )
    .get(tokenHash, new Date().toISOString()) as DbUser | undefined;
}

export function createUser(input: { id: string; email: string; name: string; passwordHash: string }) {
  getDb()
    .prepare("INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(input.id, input.email.toLowerCase(), input.name, input.passwordHash, new Date().toISOString());
}

export function createSessionRow(input: { id: string; userId: string; tokenHash: string; expiresAt: string }) {
  getDb()
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(input.id, input.userId, input.tokenHash, input.expiresAt, new Date().toISOString());
}

export function deleteSessionByTokenHash(tokenHash: string) {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function createPublicChallenge(input: {
  id: string;
  creatorId: string;
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  durationDays: number;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
}) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `
      INSERT INTO challenges (
        id, creator_id, slug, title, level, category, duration_days, goal, description,
        rules_json, tips_json, visibility, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', 'published', ?, ?)
    `
    )
    .run(
      input.id,
      input.creatorId,
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
      now
    );
}

export function startParticipationForUser(input: { userId: string; challengeSlug: string }) {
  const challengeId = ensureChallengeRow(input.challengeSlug);
  const now = new Date().toISOString();
  const participationId = randomUUID();

  getDb()
    .prepare(
      `
      INSERT OR IGNORE INTO participations (id, user_id, challenge_id, started_at, status)
      VALUES (?, ?, ?, ?, 'active')
    `
    )
    .run(participationId, input.userId, challengeId, now);

  return getParticipationByUserAndChallenge(input.userId, challengeId);
}

export function getParticipationByIdForUser(input: { participationId: string; userId: string }) {
  const row = getDb()
    .prepare(
      `
      SELECT
        participations.id,
        participations.user_id as userId,
        participations.challenge_id as challengeId,
        participations.started_at as startedAt,
        participations.status,
        participations.completed_at as completedAt,
        challenges.slug as challengeSlug,
        challenges.title as challengeTitle,
        challenges.goal as challengeGoal
      FROM participations
      JOIN challenges ON challenges.id = participations.challenge_id
      WHERE participations.id = ? AND participations.user_id = ?
    `
    )
    .get(input.participationId, input.userId) as DbParticipation | undefined;

  return row ? mapParticipationRow(row) : undefined;
}

export function getParticipationsForUser(userId: string) {
  const rows = getDb()
    .prepare(
      `
      SELECT
        participations.id,
        participations.user_id as userId,
        participations.challenge_id as challengeId,
        participations.started_at as startedAt,
        participations.status,
        participations.completed_at as completedAt,
        challenges.slug as challengeSlug,
        challenges.title as challengeTitle,
        challenges.goal as challengeGoal
      FROM participations
      JOIN challenges ON challenges.id = participations.challenge_id
      WHERE participations.user_id = ?
      ORDER BY participations.started_at DESC
    `
    )
    .all(userId) as DbParticipation[];

  return rows.map(mapParticipationRow);
}

export function getParticipationCountByChallengeSlug(slug: string) {
  const row = getDb()
    .prepare(
      `
      SELECT COUNT(participations.id) as count
      FROM challenges
      LEFT JOIN participations ON participations.challenge_id = challenges.id
      WHERE challenges.slug = ?
    `
    )
    .get(slug) as { count: number } | undefined;

  return row?.count ?? 0;
}

export function getParticipationCountsByChallengeSlug() {
  const rows = getDb()
    .prepare(
      `
      SELECT challenges.slug, COUNT(participations.id) as count
      FROM challenges
      LEFT JOIN participations ON participations.challenge_id = challenges.id
      GROUP BY challenges.slug
    `
    )
    .all() as Array<{ slug: string; count: number }>;

  return rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.slug] = row.count;
    return counts;
  }, {});
}

export function getCheckInDatesForParticipation(input: { participationId: string; userId: string }) {
  const rows = getDb()
    .prepare(
      `
      SELECT check_ins.date
      FROM check_ins
      JOIN participations ON participations.id = check_ins.participation_id
      WHERE check_ins.participation_id = ? AND participations.user_id = ?
      ORDER BY check_ins.date ASC
    `
    )
    .all(input.participationId, input.userId) as Array<{ date: string }>;

  return rows.map((row) => row.date);
}

export function createCheckInForParticipation(input: { participationId: string; userId: string; date: string }) {
  const participation = getParticipationByIdForUser({
    participationId: input.participationId,
    userId: input.userId
  });

  if (!participation) {
    throw new Error("Participation not found.");
  }

  getDb()
    .prepare(
      `
      INSERT OR IGNORE INTO check_ins (id, participation_id, date, note, created_at)
      VALUES (?, ?, ?, NULL, ?)
    `
    )
    .run(randomUUID(), input.participationId, input.date, new Date().toISOString());
}

function getParticipationByUserAndChallenge(userId: string, challengeId: string) {
  const participation = getDb()
    .prepare(
      `
      SELECT id FROM participations
      WHERE user_id = ? AND challenge_id = ?
    `
    )
    .get(userId, challengeId) as { id: string } | undefined;

  if (!participation) {
    throw new Error("Participation could not be created.");
  }

  return participation;
}

function mapParticipationRow(row: DbParticipation): DbParticipation {
  return {
    id: row.id,
    userId: row.userId,
    challengeId: row.challengeId,
    challengeSlug: row.challengeSlug,
    challengeTitle: row.challengeTitle,
    challengeGoal: row.challengeGoal,
    startedAt: row.startedAt,
    status: row.status,
    completedAt: row.completedAt
  };
}

function ensureChallengeRow(slug: string) {
  const existing = getDb().prepare("SELECT id FROM challenges WHERE slug = ?").get(slug) as { id: string } | undefined;

  if (existing) {
    return existing.id;
  }

  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  ensureSystemUser();

  const now = new Date().toISOString();
  const challengeId = `curated:${challenge.slug}`;

  getDb()
    .prepare(
      `
      INSERT INTO challenges (
        id, creator_id, slug, title, level, category, duration_days, goal, description,
        rules_json, tips_json, visibility, status, created_at, updated_at
      )
      VALUES (?, 'system', ?, ?, ?, 'Kuratierte Challenge', 0, ?, ?, ?, ?, 'internal', 'published', ?, ?)
    `
    )
    .run(
      challengeId,
      challenge.slug,
      challenge.title,
      challenge.level,
      challenge.goal,
      challenge.description,
      JSON.stringify(challenge.rules),
      JSON.stringify(challenge.tips),
      now,
      now
    );

  return challengeId;
}

function ensureSystemUser() {
  const existing = getDb().prepare("SELECT id FROM users WHERE id = 'system'").get();

  if (existing) {
    return;
  }

  getDb()
    .prepare("INSERT INTO users (id, email, name, password_hash, created_at) VALUES ('system', ?, 'ChallengeHub', 'disabled:disabled', ?)")
    .run("system@challengehub.local", new Date().toISOString());
}

export function getPublishedChallenges() {
  const rows = getDb()
    .prepare(
      `
      SELECT challenges.*, users.name as creator_name
      FROM challenges
      JOIN users ON users.id = challenges.creator_id
      WHERE challenges.visibility = 'public' AND challenges.status = 'published'
      ORDER BY challenges.created_at DESC
    `
    )
    .all();

  return rows.map(mapChallengeRow);
}

export function getPublishedChallengeBySlug(slug: string) {
  const row = getDb()
    .prepare(
      `
      SELECT challenges.*, users.name as creator_name
      FROM challenges
      JOIN users ON users.id = challenges.creator_id
      WHERE challenges.slug = ? AND challenges.visibility = 'public' AND challenges.status = 'published'
    `
    )
    .get(slug);

  return row ? mapChallengeRow(row) : null;
}

export function getExistingChallengeSlugs() {
  const rows = getDb().prepare("SELECT slug FROM challenges").all() as Array<{ slug: string }>;
  return rows.map((row) => row.slug);
}

function mapChallengeRow(row: unknown) {
  const challenge = row as {
    id: string;
    creator_id: string;
    slug: string;
    title: string;
    level: ChallengeLevel;
    category: string;
    duration_days: number;
    goal: string;
    description: string;
    rules_json: string;
    tips_json: string;
    created_at: string;
    creator_name: string;
  };

  return {
    id: challenge.id,
    creatorId: challenge.creator_id,
    slug: challenge.slug,
    title: challenge.title,
    level: challenge.level,
    category: challenge.category,
    durationDays: challenge.duration_days,
    goal: challenge.goal,
    description: challenge.description,
    rules: parseList(challenge.rules_json),
    tips: parseList(challenge.tips_json),
    createdAt: challenge.created_at,
    creatorName: challenge.creator_name
  } satisfies DbPublicChallenge;
}

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}
