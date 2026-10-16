import * as assert from "node:assert/strict";
import { test } from "node:test";
import { rankChallengeParticipants } from "../lib/challenge-progress.ts";
import { getCuratedChallengeDefinition } from "../domain/challenges/challenge-definition.ts";

test("feste Ziele werten geschafft vor Wiederholungszahl und nach optionaler Bestzeit", () => {
  const definition = getCuratedChallengeDefinition(
    "100-liegestuetze-am-stueck",
  );
  const entries = rankChallengeParticipants(
    [
      ["untimed", 120, null],
      ["slow", 100, 240],
      ["fast", 100, 132],
      ["untimed2", 100, null],
      ["open", 99, 1],
    ].map(([id, value, bestTimeSeconds]) => ({
      id: String(id),
      name: String(id),
      startedAt: "2026-10-16T10:00:00Z",
      definition,
      bestTimeSeconds: bestTimeSeconds as number | null,
      checkIns: [{ date: "2026-10-16", value: value as number }],
    })),
    "2026-10-16",
  );
  assert.deepEqual(
    entries.map((e) => e.id),
    ["fast", "slow", "untimed", "untimed2", "open"],
  );
  assert.deepEqual(
    entries.map((e) => e.rank),
    [1, 2, 3, 3, 5],
  );
  assert.equal(entries[0].scoreLabel, "2:12 min");
  assert.equal(entries[2].scoreLabel, "Geschafft");
  assert.equal(entries[4].scoreLabel, "Noch offen");
});

test("Plank behält längste Dauer, Zeitziele werten kürzeste erfolgreiche Dauer", () => {
  for (const [slug, values, expected] of [
    ["10min-am-stueck-planken-challenge", [600, 720], [720, 600]],
    ["5-km-in-weniger-als-20-minuten", [1300, 1100, 1000], [1000, 1100, 1300]],
  ] as const) {
    const definition = getCuratedChallengeDefinition(slug);
    const entries = rankChallengeParticipants(
      values.map((value) => ({
        id: String(value),
        name: String(value),
        startedAt: "2026-10-16",
        definition,
        checkIns: [{ date: "2026-10-16", value }],
      })),
      "2026-10-16",
    );
    assert.deepEqual(
      entries.map((e) => Number(e.id)),
      expected,
    );
  }
});
