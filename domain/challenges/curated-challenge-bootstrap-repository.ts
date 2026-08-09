export type CuratedChallengeBootstrapInput = {
  id: string;
  slug: string;
  title: string;
  level: string;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
  definition: ChallengeDefinition;
};

export interface CuratedChallengeBootstrapRepository {
  ensureChallenge(input: CuratedChallengeBootstrapInput): string;
}
import type { ChallengeDefinition } from "./challenge-definition.ts";
