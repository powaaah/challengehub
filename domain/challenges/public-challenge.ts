import type { ChallengeLevel } from "../../data/challenges.ts";
import type { ChallengeDefinition } from "./challenge-definition.ts";

export type PublicChallenge = {
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
  createdAt: string;
  creatorName: string;
  definition: ChallengeDefinition;
};

export interface PublicChallengeRepository {
  listPublished(): Promise<PublicChallenge[]>;
  findPublishedBySlug(slug: string): Promise<PublicChallenge | null>;
}
