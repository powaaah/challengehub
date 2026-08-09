import * as assert from "node:assert/strict";
import { test } from "node:test";
import { calculateChallengeOutcome } from "../domain/challenges/challenge-outcome.ts";

test("kumulative Challenges addieren Messwerte bis zum Ziel", () => {
  const outcome = calculateChallengeOutcome({
    definition: {
      type: "cumulative_metric",
      unit: "repetitions",
      targetValue: 1000,
      frequency: "challenge_period",
      direction: "at_least",
      completionCriterion: "cumulative_target"
    },
    checkIns: [
      { date: "2026-08-08", value: 250 },
      { date: "2026-08-09", value: 400 }
    ]
  });

  assert.deepEqual(outcome, {
    value: 650,
    completionRate: 65,
    completed: false,
    label: "650 von 1.000 Wiederholungen"
  });
});

test("einmalige Ergebnisse beachten die Messrichtung", () => {
  const outcome = calculateChallengeOutcome({
    definition: {
      type: "one_time_result",
      unit: "seconds",
      targetValue: 1200,
      frequency: "once",
      direction: "at_most",
      completionCriterion: "single_result"
    },
    checkIns: [
      { date: "2026-08-08", value: 1270 },
      { date: "2026-08-09", value: 1195 }
    ]
  });

  assert.deepEqual(outcome, {
    value: 1195,
    completionRate: 100,
    completed: true,
    label: "19:55 Minuten"
  });
});

test("Mess-Challenges ignorieren Check-ins ohne fachlich passenden Zahlenwert", () => {
  const outcome = calculateChallengeOutcome({
    definition: {
      type: "cumulative_metric",
      unit: "kilometers",
      targetValue: 100,
      frequency: "challenge_period",
      direction: "at_least",
      completionCriterion: "cumulative_target"
    },
    checkIns: [{ date: "2026-08-09", value: null }]
  });

  assert.equal(outcome.value, 0);
  assert.equal(outcome.completionRate, 0);
  assert.equal(outcome.completed, false);
});
