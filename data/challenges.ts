import { generatedChallenges } from "./challenges.generated.ts";
import type { ChallengeDefinition } from "../domain/challenges/challenge-definition.ts";
import type { FileChallenge } from "../lib/challenge-markdown.ts";

export type ChallengeLevel = "User" | "Beginner" | "Advanced" | "Premium";

export type Challenge = {
  title: string;
  slug: string;
  definition: ChallengeDefinition;
  level: ChallengeLevel;
  participants: number;
  rating: number;
  createdAt: string;
  duration: string;
  goal: string;
  description: string;
  seoDescription: string;
  tips: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
  benefits?: ChallengeBenefit[];
  plan?: ChallengePlan;
  stack?: Array<{
    title: string;
    text: string;
  }>;
  rules: string[];
};

export type ChallengeBenefit = {
  title: string;
  text: string;
  source: {
    label: string;
    url: string;
  };
};

export type ChallengePlan = {
  title: string;
  intro: string;
  weeks: Array<{
    label: string;
    focus: string;
    tasks: string[];
  }>;
};

export const challenges: FileChallenge[] = generatedChallenges as FileChallenge[];

export const levelLabels: Record<ChallengeLevel, string> = {
  User: "User Challenge",
  Beginner: "Beginner Challenge",
  Advanced: "Advanced Challenge",
  Premium: "Premium Challenge"
};

export function getChallengeBySlug(slug: string) {
  return challenges.find((challenge) => challenge.slug === slug);
}
