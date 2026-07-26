import type { ChallengeLevel } from "../../data/challenges.ts";

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
};

export interface PublicChallengeRepository {
  listPublished(): Promise<PublicChallenge[]>;
  findPublishedBySlug(slug: string): Promise<PublicChallenge | null>;
}
