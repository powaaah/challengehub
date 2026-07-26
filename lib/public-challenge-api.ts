import { challenges, getChallengeBySlug } from "../data/challenges.ts";
import {
  createPublicChallengeApiEnvelope,
  mergePublicChallengeApiItems,
  paginatePublicChallengeApiItems,
  toCommunityChallengeApiItem,
  toCuratedChallengeApiItem,
  type PublicChallengeApiPagination
} from "../domain/challenges/public-challenge-api.ts";
import { SITE_URL } from "./seo.ts";
import { getPublishedChallengeBySlug, getPublishedChallenges } from "./public-challenges.ts";

export async function listPublicChallengesForApi(pagination: PublicChallengeApiPagination) {
  const curated = challenges.map((challenge) => toCuratedChallengeApiItem(challenge, SITE_URL));
  const community = (await getPublishedChallenges()).map((challenge) =>
    toCommunityChallengeApiItem(challenge, SITE_URL)
  );

  return paginatePublicChallengeApiItems(
    mergePublicChallengeApiItems(curated, community),
    pagination
  );
}

export async function findPublicChallengeForApi(slug: string) {
  const curated = getChallengeBySlug(slug);
  if (curated) {
    return createPublicChallengeApiEnvelope(toCuratedChallengeApiItem(curated, SITE_URL));
  }

  const community = await getPublishedChallengeBySlug(slug);
  return community
    ? createPublicChallengeApiEnvelope(toCommunityChallengeApiItem(community, SITE_URL))
    : null;
}
