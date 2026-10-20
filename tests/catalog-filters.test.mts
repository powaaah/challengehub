import test from "node:test";
import assert from "node:assert/strict";
import { emptyCatalogFilters, getChallengeFormat, matchesCatalogFilters, ratingFromSlider } from "../domain/challenges/catalog-filters.ts";
import { getCuratedChallengeDefinition } from "../domain/challenges/challenge-definition.ts";

test("catalog format respects editorial one-off and ongoing labels and typed results", () => {
  assert.equal(getChallengeFormat({ duration: "Einmalig", definition: getCuratedChallengeDefinition("1000-liegestuetze-challenge") }), "once");
  assert.equal(getChallengeFormat({ duration: "Dauerhaft" }), "ongoing");
  assert.equal(getChallengeFormat({ duration: "Auf Zeit", definition: getCuratedChallengeDefinition("5-minuten-calisthenics-challenge") }), "once");
  assert.equal(getChallengeFormat({ duration: "100 Tage" }), "period");
  assert.equal(getChallengeFormat({ durationDays: 30 }), "period");
});

test("no restriction includes unrated, zero-participant and legacy-level challenges", () => {
  for (const level of ["User", "Premium", "Beginner", "Advanced"] as const) {
    assert.equal(matchesCatalogFilters({ level, format: "once", participants: 0 }, emptyCatalogFilters), true);
  }
});

test("categories combine with OR, groups with AND, bounds are inclusive", () => {
  const filters = { ...emptyCatalogFilters, formats: ["once", "period"] as const, levels: ["Beginner", "Advanced"] as const, minimumRating: 4, minimumParticipants: 10, maximumParticipants: 50 };
  const mutable = { ...filters, formats: [...filters.formats], levels: [...filters.levels] };
  const challenge = { level: "Advanced" as const, format: "once" as const, participants: 10, rating: 4 };
  assert.ok(matchesCatalogFilters(challenge, mutable));
  assert.ok(matchesCatalogFilters({ ...challenge, level: "Beginner", format: "period", participants: 50 }, mutable));
  for (const patch of [{ rating: 3.99 }, { rating: undefined }, { participants: 9 }, { participants: 51 }, { format: "ongoing" as const }, { level: "Premium" as const }]) {
    assert.equal(matchesCatalogFilters({ ...challenge, ...patch }, mutable), false);
  }
});

test("zero maximum means zero participants and minimum-only has no upper limit", () => {
  const challenge = { level: "Beginner" as const, format: "period" as const, participants: 0 };
  assert.ok(matchesCatalogFilters(challenge, { ...emptyCatalogFilters, maximumParticipants: 0 }));
  assert.equal(matchesCatalogFilters({ ...challenge, participants: 1 }, { ...emptyCatalogFilters, maximumParticipants: 0 }), false);
  assert.ok(matchesCatalogFilters({ ...challenge, participants: 10000 }, { ...emptyCatalogFilters, minimumParticipants: 10 }));
});

test("rating slider includes all then one through five stars in half steps", () => {
  assert.deepEqual(Array.from({ length: 10 }, (_, step) => ratingFromSlider(step)), [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]);
});
