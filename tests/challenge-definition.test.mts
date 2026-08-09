import * as assert from "node:assert/strict";
import { test } from "node:test";
import {
  DAILY_BOOLEAN_DEFINITION,
  createChallengeDefinition,
  getCuratedChallengeDefinition,
  parseChallengeDefinition
} from "../domain/challenges/challenge-definition.ts";

test("tägliche Ja/Nein-Challenges besitzen eine vollständig typisierte Standarddefinition", () => {
  assert.deepEqual(DAILY_BOOLEAN_DEFINITION, {
    type: "daily_boolean",
    unit: "completion",
    targetValue: 1,
    frequency: "daily",
    direction: "at_least",
    completionCriterion: "daily_check_in"
  });
  assert.deepEqual(parseChallengeDefinition(DAILY_BOOLEAN_DEFINITION), DAILY_BOOLEAN_DEFINITION);
});

test("Erstellungsdaten werden nur in konsistente Challenge-Definitionen übersetzt", () => {
  assert.deepEqual(createChallengeDefinition({
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 250,
    direction: "at_least"
  }), {
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 250,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  });
  assert.deepEqual(createChallengeDefinition({
    type: "one_time_result",
    unit: "seconds",
    targetValue: 1200,
    direction: "at_most"
  }), {
    type: "one_time_result",
    unit: "seconds",
    targetValue: 1200,
    frequency: "once",
    direction: "at_most",
    completionCriterion: "single_result"
  });
  assert.deepEqual(createChallengeDefinition({ type: "daily_boolean" }), DAILY_BOOLEAN_DEFINITION);
  assert.equal(createChallengeDefinition({
    type: "cumulative_metric",
    unit: "completion",
    targetValue: 10,
    direction: "at_least"
  }), null);
});

test("kuratierte Challenges erhalten reproduzierbare fachliche Definitionen", () => {
  assert.deepEqual(getCuratedChallengeDefinition("1000-liegestuetze-challenge"), {
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 1000,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  });
  assert.deepEqual(getCuratedChallengeDefinition("marathon-unter-3-stunden"), {
    type: "one_time_result",
    unit: "seconds",
    targetValue: 10800,
    frequency: "once",
    direction: "at_most",
    completionCriterion: "single_result"
  });
  assert.deepEqual(
    getCuratedChallengeDefinition("10000-schritte-am-tag"),
    DAILY_BOOLEAN_DEFINITION
  );
});

test("Domainparser lehnt widersprüchliche Typ- und Abschlusskombinationen ab", () => {
  assert.equal(parseChallengeDefinition({
    type: "daily_boolean",
    unit: "kilograms",
    targetValue: 500,
    frequency: "once",
    direction: "at_least",
    completionCriterion: "single_result"
  }), null);
  assert.equal(parseChallengeDefinition({
    type: "one_time_result",
    unit: "seconds",
    targetValue: -1,
    frequency: "once",
    direction: "at_most",
    completionCriterion: "single_result"
  }), null);
});
