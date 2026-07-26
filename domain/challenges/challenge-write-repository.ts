import type { ChallengeLevel } from "../../data/challenges.ts";

export type CreatePublishedChallengeInput = {
  id: string;
  creatorId: string;
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  durationDays: number;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
};

export type CreatePublishedChallengeResult =
  | { status: "created"; slug: string }
  | { status: "creator_not_found" | "slug_conflict" };

export type ChallengeCreationCandidate = {
  slug: string;
  title: string;
};

export interface ChallengeWriteRepository {
  listSlugs(): string[];
  listPublishedChallenges(): ChallengeCreationCandidate[];
  createPublished(input: CreatePublishedChallengeInput): CreatePublishedChallengeResult;
}