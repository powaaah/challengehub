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
    "0005_password_reset_tokens.sql",
    "0006_password_reset_rate_limits.sql",
    "0007_action_rate_limits.sql",
    "0008_pending_challenge_default.sql",
    "0009_rate_limit_pruning_index.sql",
    "0010_challenge_types.sql",
    "0011_challenge_mates.sql",
    "0012_retention_notifications.sql",
    "0013_account_privacy.sql",
    "0014_email_verification.sql"
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
  assert.match(sql, /WHILE EXISTS/);
  assert.match(sql, /username_migration_reserved/);
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

test("password reset rate-limit migration stores only hashed identifiers", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0006_password_reset_rate_limits.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE password_reset_requests/);
  assert.match(sql, /email_hash TEXT NOT NULL/);
  assert.match(sql, /ip_hash TEXT NOT NULL/);
  assert.match(sql, /password_reset_requests_email_created_idx/);
  assert.match(sql, /password_reset_requests_ip_created_idx/);
  assert.doesNotMatch(sql, /email TEXT|ip_address/);
});

test("action rate-limit migration separates scopes and stores only hashed keys", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0007_action_rate_limits.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE rate_limit_events/);
  assert.match(sql, /scope TEXT NOT NULL/);
  assert.match(sql, /key_hash TEXT NOT NULL/);
  assert.match(sql, /rate_limit_events_scope_key_created_idx/);
  assert.doesNotMatch(sql, /email TEXT|ip_address|user_id/);
});

test("community challenges default to pending moderation", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0008_pending_challenge_default.sql"),
    "utf8"
  );

  assert.match(sql, /ALTER COLUMN status SET DEFAULT 'pending'/);
});

test("rate-limit pruning migration adds an efficient global time index", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0009_rate_limit_pruning_index.sql"),
    "utf8"
  );

  assert.match(sql, /rate_limit_events_created_idx/);
  assert.match(sql, /ON rate_limit_events \(created_at\)/);
});

test("challenge type migration adds typed definitions and deterministic legacy values", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0010_challenge_types.sql"),
    "utf8"
  );

  for (const column of [
    "challenge_type",
    "metric_unit",
    "target_value",
    "frequency",
    "measurement_direction",
    "completion_criterion"
  ]) {
    assert.match(sql, new RegExp(`ADD COLUMN ${column}`));
  }
  assert.match(sql, /ADD COLUMN value DOUBLE PRECISION/);
  assert.match(sql, /WHEN slug = '1000-liegestuetze-challenge' THEN 'cumulative_metric'/);
  assert.match(sql, /WHEN slug IN \([\s\S]*'marathon-unter-3-stunden'[\s\S]*\) THEN 'one_time_result'/);
  assert.match(sql, /CHECK \(challenge_type IN \('daily_boolean', 'cumulative_metric', 'one_time_result'\)\)/);
});

test("ChallengeMate migration persists opt-in, mutual matches, blocks and reports", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0011_challenge_mates.sql"),
    "utf8"
  );

  for (const table of [
    "challenge_mate_profiles",
    "challenge_mate_connections",
    "challenge_mate_blocks",
    "challenge_mate_reports"
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE ${table}`));
  }
  assert.match(sql, /CHECK \(mode IN \('remote', 'local'\)\)/);
  assert.match(sql, /UNIQUE \(user_low_id, user_high_id\)/);
  assert.match(sql, /CHECK \(requester_user_id <> recipient_user_id\)/);
  assert.match(sql, /CHECK \(reporter_user_id <> reported_user_id\)/);
  assert.doesNotMatch(sql, /email|phone|latitude|longitude|contact_details/);
});

test("Retention migration persists preferences, an idempotent feed and delivery state", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0012_retention_notifications.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE retention_preferences/);
  assert.match(sql, /email_reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /weekly_recap_enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /CREATE TABLE retention_notifications/);
  assert.match(sql, /source_key TEXT NOT NULL/);
  assert.match(sql, /UNIQUE \(user_id, source_key\)/);
  assert.match(sql, /email_delivered_at TIMESTAMPTZ/);
  assert.match(sql, /retention_notifications_pending_email_idx/);
  assert.doesNotMatch(sql, /unsubscribe_token|raw_token/);
});

test("Account-Privacy-Migration setzt datensparsame Defaults und anonyme Löschungsnachweise", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0013_account_privacy.sql"),
    "utf8"
  );

  assert.match(sql, /CREATE TABLE account_privacy_preferences/);
  assert.match(sql, /ranking_visible BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /activity_visible BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /challenge_mate_discoverable BOOLEAN NOT NULL DEFAULT FALSE/);
  assert.match(sql, /CREATE TABLE account_deletion_audits/);
  assert.match(sql, /retention_basis TEXT NOT NULL/);
  assert.doesNotMatch(sql, /deleted_user_id|email|name|password|token/);
});

test("E-Mail-Verifikationsmigration speichert Status und ausschließlich gehashte Einmal-Tokens", async () => {
  const sql = await readFile(
    path.join(migrationsDirectory, "0014_email_verification.sql"),
    "utf8"
  );

  assert.match(sql, /ADD COLUMN email_verified_at TIMESTAMPTZ/);
  assert.match(sql, /CREATE TABLE email_verification_tokens/);
  assert.match(sql, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(sql, /expires_at TIMESTAMPTZ NOT NULL/);
  assert.match(sql, /used_at TIMESTAMPTZ/);
  assert.doesNotMatch(sql, /raw_token|\btoken\s+TEXT|secret/i);
});
