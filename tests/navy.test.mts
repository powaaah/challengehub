import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import {
  navyBodyFat,
  bodyScore,
  emptyBodyState,
  habitValue,
  validBodyDate,
} from "../domain/challenges/navy.ts";
import { updateBody } from "../domain/challenges/body-update.ts";
import {
  ensureBodyTransformation,
  ownsBody,
  writeBody,
  readBody,
} from "../infrastructure/sqlite/sqlite-body-transformation.ts";
import { isSameOriginRequest } from "../domain/security/same-origin.ts";

test("same-origin writes work behind TLS proxy and reject cross-site and missing origins", () => {
  assert.equal(
    isSameOriginRequest(
      new Request("http://localhost:3000/api", {
        headers: { host: "theovina.de", origin: "https://theovina.de" },
      }),
    ),
    true,
  );
  assert.equal(
    isSameOriginRequest(
      new Request("http://localhost:3000/api", {
        headers: { host: "theovina.de", origin: "https://evil.example" },
      }),
    ),
    false,
  );
  assert.equal(
    isSameOriginRequest(new Request("http://localhost:3000/api")),
    false,
  );
});

test("Navy converts cm to inches and reproduces independently calculated formula fixtures", () => {
  assert.ok(
    Math.abs(
      navyBodyFat(
        { variant: "male", height: 69 * 2.54 },
        { waist: 49 * 2.54, neck: 16 * 2.54, hip: null },
      )! - 38.57255,
    ) < 0.00001,
  );
  assert.ok(
    Math.abs(
      navyBodyFat(
        { variant: "female", height: 64 * 2.54 },
        { waist: 42 * 2.54, neck: 15 * 2.54, hip: 44 * 2.54 },
      )! - 47.31273,
    ) < 0.00001,
  );
  assert.equal(
    navyBodyFat(
      { variant: "male", height: 180 },
      { waist: 30, neck: 40, hip: null },
    ),
    null,
  );
  assert.equal(
    navyBodyFat(
      { variant: "female", height: 165 },
      { waist: 80, neck: 30, hip: null },
    ),
    null,
  );
});
const window = { start: "2026-01-01", end: "2026-04-10", today: "2026-04-10" };
const input = {
  action: "measurement",
  date: window.start,
  variant: "male",
  height: "180",
  weight: "90",
  waist: "100",
  neck: "40",
};
test("measurement validation rejects impossible dates, future values and profile changes", () => {
  assert.equal(
    validBodyDate("2026-02-30", window.start, window.end, window.today),
    false,
  );
  for (const overrides of [
    { date: "2026-04-11" },
    { date: "2025-12-31" },
    { weight: "" },
    { weight: Infinity },
    { waist: 0 },
  ])
    assert.throws(() =>
      updateBody(emptyBodyState(), { ...input, ...overrides }, window, "h"),
    );
  const state = updateBody(emptyBodyState(), input, window, "h");
  assert.throws(() =>
    updateBody(state, { ...input, height: 185 }, window, "h"),
  );
  assert.equal(
    updateBody(state, { ...input, weight: 91 }, window, "h").measurements
      .length,
    1,
  );
  assert.equal(state.measurements[0].weight, 90);
});
test("score requires day-one baseline, separates interim from day-100 and preserves negative changes", () => {
  let state = updateBody(emptyBodyState(), input, window, "h");
  assert.equal(bodyScore(state, window.start, window.end, window.today), null);
  state = updateBody(
    state,
    { ...input, date: "2026-03-01", waist: 95 },
    window,
    "h",
  );
  assert.equal(
    bodyScore(state, window.start, window.end, window.today)!.final,
    false,
  );
  state = updateBody(
    state,
    { ...input, date: window.end, waist: 105 },
    window,
    "h",
  );
  const score = bodyScore(state, window.start, window.end, window.today)!;
  assert.equal(score.final, true);
  assert.ok(score.points < 0);
  assert.equal(bodyScore(state, "2025-12-31", window.end, window.today), null);
});
test("incomplete daily measurement stays in history without inventing KFA", () => {
  const state = updateBody(
    emptyBodyState(),
    { ...input, neck: "" },
    window,
    "h",
  );
  assert.equal(state.measurements[0].neck, null);
  assert.equal(bodyScore(state, window.start, window.end, window.today), null);
});
test("weekly habit sums recorded days only, zero and absence remain distinct", () => {
  let state = updateBody(
    emptyBodyState(),
    {
      action: "habit",
      name: "Gym",
      unit: "Besuche",
      target: 3,
      period: "week",
    },
    window,
    "h",
  );
  for (const [date, value] of [
    ["2026-01-04", 3],
    ["2026-01-05", 1],
    ["2026-01-07", 1],
  ] as const)
    state = updateBody(
      state,
      { action: "habit-entry", habitId: "h", date, value },
      window,
      "h",
    );
  assert.equal(habitValue(state.habits[0], "2026-01-07"), 2);
  assert.equal(habitValue(state.habits[0], "2026-01-12"), null);
});
test("additive schema preserves existing records, scopes ownership and cascades private data", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(
    `PRAGMA foreign_keys=ON; CREATE TABLE users(id TEXT PRIMARY KEY); CREATE TABLE challenges(id TEXT PRIMARY KEY,slug TEXT); CREATE TABLE participations(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,challenge_id TEXT,started_at TEXT,status TEXT); INSERT INTO users VALUES('u');INSERT INTO challenges VALUES('c','100-tage-body-transformation'); INSERT INTO participations VALUES('p','u','c','2026-01-01','active');`,
  );
  ensureBodyTransformation(db);
  ensureBodyTransformation(db);
  assert.ok(ownsBody(db, "p", "u"));
  assert.equal(ownsBody(db, "p", "other"), undefined);
  writeBody(db, "p", updateBody(emptyBodyState(), input, window, "h"));
  assert.equal(readBody(db, "p").measurements.length, 1);
  db.prepare("INSERT INTO body_transformation_photos VALUES (?,?,?,?)").run(
    "p",
    "start",
    Buffer.from("photo"),
    "now",
  );
  db.exec("DELETE FROM users WHERE id='u'");
  assert.equal(
    db.prepare("SELECT COUNT(*) n FROM body_transformation").get()!.n,
    0,
  );
  assert.equal(
    db.prepare("SELECT COUNT(*) n FROM body_transformation_photos").get()!.n,
    0,
  );
  db.close();
});
