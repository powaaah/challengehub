import * as assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  ensureCompletionTimes,
  recordCompletionTime,
} from "../infrastructure/sqlite/sqlite-completion-times.ts";

test("Bestzeiten gelten nur für eigene abgeschlossene feste Ziele und können nur verbessert werden", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE challenges(id TEXT PRIMARY KEY, challenge_type TEXT, metric_unit TEXT);
    CREATE TABLE participations(id TEXT PRIMARY KEY, user_id TEXT, challenge_id TEXT, status TEXT);
    INSERT INTO challenges VALUES ('c','one_time_result','repetitions'),('daily','daily_boolean','completion'),('time','one_time_result','seconds');
    INSERT INTO participations VALUES ('p','u','c','completed'),('a','u','c','active'),('d','u','daily','completed'),('t','u','time','completed');`);
  ensureCompletionTimes(db);
  ensureCompletionTimes(db);
  const record = (participationId: string, seconds: number, userId = "u") =>
    recordCompletionTime(db, { participationId, userId, seconds });
  assert.equal(record("p", 132, "other"), false);
  for (const id of ["a", "d", "t", "missing"])
    assert.equal(record(id, 132), false);
  for (const seconds of [0, -1, NaN, Infinity, 604801])
    assert.equal(record("p", seconds), false);
  assert.equal(record("p", 240), true);
  assert.equal(record("p", 300), false);
  assert.equal(record("p", 132), true);
  assert.equal(
    (
      db
        .prepare(
          "SELECT seconds FROM challenge_completion_times WHERE participation_id='p'",
        )
        .get() as { seconds: number }
    ).seconds,
    132,
  );
  db.exec("DELETE FROM participations WHERE id='p'");
  assert.equal(
    db.prepare("SELECT * FROM challenge_completion_times").all().length,
    0,
  );
  db.close();
});
