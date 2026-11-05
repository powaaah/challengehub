import type { ChallengeDefinition } from "./challenge-definition.ts";

export type PublicChallengeApiItem = {
  slug: string;
  title: string;
  level: "User" | "Beginner" | "Advanced" | "Premium";
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
  definition: ChallengeDefinition;
};

export type PublicChallengeApiEnvelope<T> = {
  apiVersion: "v1";
  data: T;
};

export type PublicChallengeApiPage = PublicChallengeApiEnvelope<PublicChallengeApiItem[]> & {
  pagination: {
    limit: number;
    nextCursor: string | null;
  };
};
