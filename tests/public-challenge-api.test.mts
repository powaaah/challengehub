import * as assert from "node:assert/strict";
import { test } from "node:test";
import type { Challenge } from "../data/challenges.ts";
import {
  createPublicChallengeApiEnvelope,
  mergePublicChallengeApiItems,
  paginatePublicChallengeApiItems,
  parsePublicChallengeApiPagination,
  toCommunityChallengeApiItem,
  toCuratedChallengeApiItem
} from "../domain/challenges/public-challenge-api.ts";
import type { PublicChallenge } from "../domain/challenges/public-challenge.ts";
import { DAILY_BOOLEAN_DEFINITION } from "../domain/challenges/challenge-definition.ts";

const siteUrl = "https://challengehub.de";

const curated: Challenge = {
  title: "Test-Challenge",
  slug: "test-challenge",
  level: "Beginner",
  participants: 0,
  rating: 0,
  createdAt: "2026-07-12",
  duration: "30 Tage",
  goal: "Testziel",
  description: "Testbeschreibung",
  seoDescription: "SEO",
  tips: ["Tipp"],
  faq: [],
  rules: ["Regel"],
  definition: DAILY_BOOLEAN_DEFINITION
};

const community: PublicChallenge = {
  id: "c1",
  creatorId: "u1",
  slug: "community-challenge",
  title: "Community-Challenge",
  level: "User",
  category: "Alltag",
  durationDays: 14,
  goal: "Community-Ziel",
  description: "Community-Text",
  rules: ["Community-Regel"],
  tips: [],
  createdAt: "2026-07-12T12:00:00.000Z",
  creatorName: "Ada",
  definition: {
    type: "cumulative_metric",
    unit: "repetitions",
    targetValue: 500,
    frequency: "challenge_period",
    direction: "at_least",
    completionCriterion: "cumulative_target"
  }
};

test("v1-API bildet kuratierte und Community-Challenges auf einen stabilen Vertrag ab", () => {
  const curatedItem = toCuratedChallengeApiItem(curated, siteUrl);
  const communityItem = toCommunityChallengeApiItem(community, siteUrl);

  assert.equal(curatedItem.durationDays, 30);
  assert.equal(curatedItem.creator.name, "ChallengeHub");
  assert.equal(curatedItem.url, `${siteUrl}/challenges/test-challenge`);
  assert.equal(communityItem.durationLabel, "14 Tage");
  assert.equal(communityItem.category, "Alltag");
  assert.equal(communityItem.creator.name, "Ada");
  assert.deepEqual(curatedItem.definition, DAILY_BOOLEAN_DEFINITION);
  assert.deepEqual(communityItem.definition, community.definition);
});

test("v1-API priorisiert bei Slug-Duplikaten kuratierte Challenges", () => {
  const curatedItem = toCuratedChallengeApiItem(curated, siteUrl);
  const duplicate = { ...toCommunityChallengeApiItem(community, siteUrl), slug: curated.slug };
  const envelope = createPublicChallengeApiEnvelope(
    mergePublicChallengeApiItems([curatedItem], [duplicate])
  );

  assert.equal(envelope.apiVersion, "v1");
  assert.equal(envelope.data.length, 1);
  assert.equal(envelope.data[0].creator.name, "ChallengeHub");
});

test("v1-API paginiert stabil nach Erstellzeit und Slug", () => {
  const items = [
    { ...toCuratedChallengeApiItem(curated, siteUrl), slug: "alpha", createdAt: "2026-07-12" },
    { ...toCommunityChallengeApiItem(community, siteUrl), slug: "beta", createdAt: "2026-07-13" },
    { ...toCommunityChallengeApiItem(community, siteUrl), slug: "gamma", createdAt: "2026-07-12" }
  ];

  const firstPage = paginatePublicChallengeApiItems(items, { limit: 2, cursor: null });
  assert.deepEqual(firstPage.data.map((item) => item.slug), ["beta", "alpha"]);
  assert.equal(firstPage.pagination.limit, 2);
  assert.ok(firstPage.pagination.nextCursor);

  const secondPage = paginatePublicChallengeApiItems(items, {
    limit: 2,
    cursor: firstPage.pagination.nextCursor
  });
  assert.deepEqual(secondPage.data.map((item) => item.slug), ["gamma"]);
  assert.equal(secondPage.pagination.nextCursor, null);
});

test("v1-API validiert Limit und opaken Cursor", () => {
  assert.deepEqual(parsePublicChallengeApiPagination(new URLSearchParams()), {
    limit: 20,
    cursor: null
  });
  assert.deepEqual(parsePublicChallengeApiPagination(new URLSearchParams("limit=100")), {
    limit: 100,
    cursor: null
  });
  assert.equal(parsePublicChallengeApiPagination(new URLSearchParams("limit=0")), null);
  assert.equal(parsePublicChallengeApiPagination(new URLSearchParams("limit=101")), null);
  assert.equal(parsePublicChallengeApiPagination(new URLSearchParams("limit=2.5")), null);
  assert.equal(parsePublicChallengeApiPagination(new URLSearchParams("cursor=ungueltig")), null);
});
