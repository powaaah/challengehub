import type { ChallengeLevel } from "../../data/challenges.ts";
import type { ChallengeDefinition } from "./challenge-definition.ts";

export type CreatePendingChallengeInput = {
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
  definition: ChallengeDefinition;
};

export type CreatePendingChallengeResult =
  | { status: "created"; slug: string }
  | { status: "creator_not_found" | "slug_conflict" };

export type ChallengeCreationCandidate = {
  slug: string;
  title: string;
};

export interface ChallengeWriteRepository {
  listSlugs(): string[];
  listPublishedChallenges(): ChallengeCreationCandidate[];
  createPending(input: CreatePendingChallengeInput): CreatePendingChallengeResult;
}
