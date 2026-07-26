import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const migrationsDirectory = path.join(process.cwd(), "db", "migrations", "postgresql");

test("PostgreSQL migrations are ordered and keep a migration ledger", async () => {
  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  assert.deepEqual(files, [
    "0001_initial.sql",
    "0002_challenge_invitations.sql",
    "0003_align_challenge_levels.sql",
    "0004_unique_usernames.sql",
    "0005_password_reset_tokens.sql"
  ]);

  const versions = files.map((file) => file.slice(0, 4));
  assert.equal(new Set(versions).size, versions.length);

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDirectory, file), "utf8");

    assert.match(sql, /^BEGIN;/);
    assert.match(sql, /CREATE TABLE IF NOT EXISTS schema_migrations/);
    assert.ok(
      sql.includes(`INSERT INTO schema_migrations (version) VALUES ('${file.replace(".sql", "")}');`)
    );
    assert.match(sql, /COMMIT;\s*$/);
  }
});

test("PostgreSQL migration checksums protect immutable migration history", async () => {
  const checksumFile = await readFile(
    path.join(migrationsDirectory, "checksums.sha256"),
    "utf8"
  );
  const expectedChecksums = new Map(
    checksumFile
      .trim()
      .split("\n")
      .map((line) => {
        const match = line.trim().match(/^([a-f0-9]{64})\s{2}([^/\\]+\.sql)$/);
        assert.ok(match, `Ungültiger Checksum-Eintrag: ${line}`);
        return [match[2], match[1]] as const;
      })
  );
  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  assert.deepEqual([...expectedChecksums.keys()], files);

  for (const file of files) {
    const sql = await readFile(path.join(migrationsDirectory, file));
    const actualChecksum = createHash("sha256").update(sql).digest("hex");
    assert.equal(actualChecksum, expectedChecksums.get(file), `${file} wurde nachträglich verändert`);
  }
});

test("initial PostgreSQL schema covers the current persistence model and query indexes", async () => {
  const sql = await readFile(path.join(migrationsDirectory, "0001_initial.sql"), "utf8");

  for (const table of ["users", "sessions", "challenges", "participations", "check_ins"]) {
    assert.match(sql, new RegExp(`CREATE TABLE ${table} \\(`));
  }

  assert.match(sql, /rules_json JSONB/);
  assert.match(sql, /date DATE NOT NULL/);
  assert.match(sql, /TIMESTAMPTZ/);
  assert.match(sql, /challenges_public_listing_idx/);
  assert.match(sql, /participations_challenge_status_idx/);
  assert.match(sql, /check_ins_participation_date_idx/);
});

test("challenge invitation migration stores expiring token hashes and acceptance state", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0002_challenge_invitations.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE challenge_invitations/);
  assert.match(sql, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(sql, /expires_at TIMESTAMPTZ NOT NULL/);
  assert.match(sql, /accepted_by_user_id TEXT REFERENCES users/);
  assert.match(sql, /challenge_invitations_active_expiry_idx/);
  assert.doesNotMatch(sql, /raw_token|token TEXT/);
});

test("challenge level migration aligns PostgreSQL with the domain vocabulary", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0003_align_challenge_levels.sql"),
    "utf8"
  );

  assert.match(sql, /DROP CONSTRAINT IF EXISTS challenges_level_check/);
  assert.match(sql, /WHEN 'Fortgeschritten' THEN 'Advanced'/);
  assert.match(sql, /WHEN 'Experte' THEN 'Premium'/);
  assert.match(sql, /CHECK \(level IN \('User', 'Beginner', 'Advanced', 'Premium'\)\)/);
});

test("username migration enforces case-insensitive uniqueness", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0004_unique_usernames.sql"),
    "utf8"
  );

  assert.match(sql, /lower\(name\)/);
  assert.match(sql, /CREATE UNIQUE INDEX users_name_unique_idx/);
});

test("password reset migration stores only expiring token hashes and usage state", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0005_password_reset_tokens.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE password_reset_tokens/);
  assert.match(sql, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(sql, /expires_at TIMESTAMPTZ NOT NULL/);
  assert.match(sql, /used_at TIMESTAMPTZ/);
  assert.match(sql, /password_reset_tokens_active_expiry_idx/);
  assert.doesNotMatch(sql, /raw_token|token TEXT/);
});
