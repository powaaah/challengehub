export type CuratedChallengeBootstrapInput = {
  id: string;
  slug: string;
  title: string;
  level: string;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
};

export interface CuratedChallengeBootstrapRepository {
  ensureChallenge(input: CuratedChallengeBootstrapInput): string;
}