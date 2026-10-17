import * as assert from "node:assert/strict";
import { test } from "node:test";
import { challenges } from "../data/challenges.ts";
import { buildChallengeSeoContent } from "../lib/challenge-seo-content.ts";
import { getCuratedChallengeDefinition } from "../domain/challenges/challenge-definition.ts";

test("jede kuratierte Challenge erhält reproduzierbaren individuellen Inhalt ohne Mutation", () => {
  const intros = new Set<string>();
  for (const challenge of challenges) {
    const before = JSON.stringify(challenge);
    const content = buildChallengeSeoContent(challenge);
    assert.deepEqual(content, buildChallengeSeoContent(structuredClone(challenge)));
    assert.equal(JSON.stringify(challenge), before);
    assert.ok(content.heading.includes(challenge.title));
    assert.ok(content.intro.length > 0);
    assert.equal(content.sections[0].paragraphs[0], challenge.goal);
    assert.deepEqual(content.faq, challenge.faq);
    intros.add(content.intro);
  }
  assert.equal(intros.size, challenges.length);
});

test("Wertungstexte unterscheiden Streak, Summe, Erfolg und beide Zeitrichtungen", () => {
  const cases = [
    ["10000-schritte-am-tag", "aktueller Streak"],
    ["1000-liegestuetze-challenge", "gesammelte Summe"],
    ["100-liegestuetze-am-stueck", "Erfolge ohne Zeit"],
    ["5-minuten-calisthenics-challenge", "kürzere Zeiten"],
    ["10min-am-stueck-planken-challenge", "längere Zeiten"],
  ];
  for (const [slug, expected] of cases) {
    const challenge = challenges.find((item) => item.slug === slug)!;
    assert.ok(buildChallengeSeoContent(challenge).sections[1].paragraphs[0].includes(expected), slug);
  }
});

test("neue Community-Challenges brauchen weder Slugliste noch FAQ oder Tipps", () => {
  const content = buildChallengeSeoContent({
    title: "Neue Community-Aufgabe", description: "Eine eigene Aufgabe.",
    goal: "Gemeinsam sammeln.", duration: "7 Tage",
    definition: { ...getCuratedChallengeDefinition("1000-liegestuetze-challenge"), targetValue: 250 },
    tips: ["", " Tipp ", "Tipp"],
  });
  assert.deepEqual(content.tips, ["Tipp"]);
  assert.deepEqual(content.faq, []);
  assert.match(content.sections[0].paragraphs[1], /7 Tage.*250 Wiederholungen/);
});
