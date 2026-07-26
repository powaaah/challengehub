import * as assert from "node:assert/strict";
import { test } from "node:test";
import { findChallengeDuplicates } from "../domain/challenges/challenge-duplicates.ts";

const candidates = [
  { title: "10 000 Schritte am Tag Challenge", slug: "10000-schritte-am-tag" },
  { title: "100 Burpees pro Tag", slug: "100-burpees-pro-tag" },
  { title: "30 Tage ohne Zucker", slug: "30-tage-ohne-zucker" }
];

test("Duplikatpruefung erkennt Slug- und normalisierte Titelgleichheit", () => {
  assert.deepEqual(
    findChallengeDuplicates("10.000 Schritte am Tag", "10000-schritte-am-tag", candidates),
    [{ ...candidates[0], reason: "exact" }]
  );
});

test("Duplikatpruefung findet aehnliche Titel ohne fachfremde Treffer", () => {
  assert.deepEqual(
    findChallengeDuplicates("100 Burpees Tag Fitness", "100-burpees-tag-fitness", candidates),
    [{ ...candidates[1], reason: "similar" }]
  );
  assert.deepEqual(
    findChallengeDuplicates("Jeden Morgen zehn Minuten lesen", "zehn-minuten-lesen", candidates),
    []
  );
});
