import type { Challenge } from "../../data/challenges.ts";
import type { PublicChallenge } from "./public-challenge.ts";

export const PUBLIC_CHALLENGE_API_VERSION = "v1" as const;
export const PUBLIC_CHALLENGE_API_DEFAULT_LIMIT = 20;
export const PUBLIC_CHALLENGE_API_MAX_LIMIT = 100;

export type PublicChallengeApiItem = {
  slug: string;
  title: string;
  level: Challenge["level"];
  category: string | null;
  durationDays: number | null;
  durationLabel: string;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
  createdAt: string;
  creator: {
    name: string;
  };
  url: string;
};

export type PublicChallengeApiEnvelope<T> = {
  apiVersion: typeof PUBLIC_CHALLENGE_API_VERSION;
  data: T;
};

export type PublicChallengeApiPage = PublicChallengeApiEnvelope<PublicChallengeApiItem[]> & {
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
};

export type PublicChallengeApiPagination = {
  limit: number;
  cursor: string | null;
};

export function toCuratedChallengeApiItem(
  challenge: Challenge,
  siteUrl: string
): PublicChallengeApiItem {
  return {
    slug: challenge.slug,
    title: challenge.title,
    level: challenge.level,
    category: null,
    durationDays: parseDurationDays(challenge.duration),
    durationLabel: challenge.duration,
    goal: challenge.goal,
    description: challenge.description,
    rules: challenge.rules,
    tips: challenge.tips,
    createdAt: challenge.createdAt,
    creator: { name: "ChallengeHub" },
    url: `${siteUrl}/challenges/${challenge.slug}`
  };
}

export function toCommunityChallengeApiItem(
  challenge: PublicChallenge,
  siteUrl: string
): PublicChallengeApiItem {
  return {
    slug: challenge.slug,
    title: challenge.title,
    level: challenge.level,
    category: challenge.category,
    durationDays: challenge.durationDays,
    durationLabel: `${challenge.durationDays} Tage`,
    goal: challenge.goal,
    description: challenge.description,
    rules: challenge.rules,
    tips: challenge.tips,
    createdAt: challenge.createdAt,
    creator: { name: challenge.creatorName },
    url: `${siteUrl}/challenges/${challenge.slug}`
  };
}

export function mergePublicChallengeApiItems(
  curated: PublicChallengeApiItem[],
  community: PublicChallengeApiItem[]
): PublicChallengeApiItem[] {
  const items = new Map<string, PublicChallengeApiItem>();

  for (const challenge of [...curated, ...community]) {
    if (!items.has(challenge.slug)) {
      items.set(challenge.slug, challenge);
    }
  }

  return Array.from(items.values()).sort(comparePublicChallengeApiItems);
}

export function parsePublicChallengeApiPagination(
  searchParams: URLSearchParams
): PublicChallengeApiPagination | null {
  const rawLimit = searchParams.get("limit");
  const limit = rawLimit === null ? PUBLIC_CHALLENGE_API_DEFAULT_LIMIT : Number(rawLimit);
  const cursor = searchParams.get("cursor");

  if (!Number.isInteger(limit) || limit < 1 || limit > PUBLIC_CHALLENGE_API_MAX_LIMIT) {
    return null;
  }

  if (cursor !== null && decodePublicChallengeApiCursor(cursor) === null) {
    return null;
  }

  return { limit, cursor };
}

export function paginatePublicChallengeApiItems(
  items: PublicChallengeApiItem[],
  pagination: PublicChallengeApiPagination
): PublicChallengeApiPage {
  const sortedItems = [...items].sort(comparePublicChallengeApiItems);
  const decodedCursor = pagination.cursor
    ? decodePublicChallengeApiCursor(pagination.cursor)
    : null;
  const itemsAfterCursor = decodedCursor
    ? sortedItems.filter((item) => compareItemWithCursor(item, decodedCursor) > 0)
    : sortedItems;
  const pageItems = itemsAfterCursor.slice(0, pagination.limit);
  const hasNextPage = itemsAfterCursor.length > pageItems.length;
  const lastItem = pageItems[pageItems.length - 1];

  return {
    apiVersion: PUBLIC_CHALLENGE_API_VERSION,
    data: pageItems,
    pagination: {
      limit: pagination.limit,
      nextCursor: hasNextPage && lastItem ? encodePublicChallengeApiCursor(lastItem) : null
    }
  };
}

export function createPublicChallengeApiEnvelope<T>(data: T): PublicChallengeApiEnvelope<T> {
  return { apiVersion: PUBLIC_CHALLENGE_API_VERSION, data };
}

function parseDurationDays(duration: string): number | null {
  const match = duration.match(/^(\d+)\s+Tage?$/i);
  return match ? Number(match[1]) : null;
}

type PublicChallengeApiCursor = {
  createdAt: string;
  slug: string;
};

function comparePublicChallengeApiItems(
  left: PublicChallengeApiItem,
  right: PublicChallengeApiItem
): number {
  const dateComparison = right.createdAt.localeCompare(left.createdAt);
  return dateComparison || left.slug.localeCompare(right.slug);
}

function compareItemWithCursor(
  item: PublicChallengeApiItem,
  cursor: PublicChallengeApiCursor
): number {
  const dateComparison = cursor.createdAt.localeCompare(item.createdAt);
  return dateComparison || item.slug.localeCompare(cursor.slug);
}

function encodePublicChallengeApiCursor(item: PublicChallengeApiItem): string {
  return Buffer.from(JSON.stringify({ createdAt: item.createdAt, slug: item.slug })).toString(
    "base64url"
  );
}

function decodePublicChallengeApiCursor(cursor: string): PublicChallengeApiCursor | null {
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as unknown;
    if (
      typeof value !== "object" ||
      value === null ||
      !("createdAt" in value) ||
      !("slug" in value) ||
      typeof value.createdAt !== "string" ||
      typeof value.slug !== "string" ||
      value.createdAt.length === 0 ||
      value.slug.length === 0
    ) {
      return null;
    }

    return { createdAt: value.createdAt, slug: value.slug };
  } catch {
    return null;
  }
}
