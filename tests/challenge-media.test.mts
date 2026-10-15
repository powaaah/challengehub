import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { challenges, getChallengeBySlug } from "../data/challenges.ts";
import { challengeHeaders } from "../data/challenge-headers.ts";
import { calculateChallengeOutcome } from "../domain/challenges/challenge-outcome.ts";

test("every curated challenge has a local photo and concise header copy", () => {
  for (const challenge of challenges) {
    const header = challengeHeaders[challenge.slug];
    assert.ok(header, challenge.slug);
    assert.ok(existsSync(`public/images/challenges/${header.image}.jpg`), challenge.slug);
    assert.ok(header.alt.length > 15);
    assert.ok(header.summary.length < 330, challenge.slug);
  }
});

test("calisthenics time target and best result use seconds, not repetition totals", () => {
  const challenge = getChallengeBySlug("5-minuten-calisthenics-challenge")!;
  assert.ok(challenge);
  assert.equal(challenge.definition.unit, "seconds");
  const result = (value: number) => calculateChallengeOutcome({ definition: challenge.definition, checkIns: [{ date: "2026-10-15", value }] });
  assert.equal(result(301).completed, false);
  assert.equal(result(300).completed, true);
  assert.equal(result(163).label, "2:43 Minuten");
  assert.equal(result(0).completed, false);
  const best = calculateChallengeOutcome({ definition: challenge.definition, checkIns: [{date:"2026-10-14",value:360},{date:"2026-10-15",value:163}] });
  assert.equal(best.value, 163);
});
