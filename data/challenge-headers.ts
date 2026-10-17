import { challenges } from "./challenges.ts";

export type ChallengeHeaderContent = {
  image: string;
  alt: string;
  summary: string;
  highlight: string;
  caption: string;
};

export const challengeHeaders: Record<string, ChallengeHeaderContent> = Object.fromEntries(challenges.map(challenge => [challenge.slug, challenge.header]));
