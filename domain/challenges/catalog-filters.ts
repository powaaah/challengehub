import type { ChallengeLevel } from "../../data/challenges.ts";
import type { ChallengeDefinition } from "./challenge-definition.ts";

export type ChallengeFormat = "once" | "period" | "ongoing";
export type CatalogFilters = {
  formats: ChallengeFormat[];
  levels: ChallengeLevel[];
  minimumRating: number;
  minimumParticipants: number | null;
  maximumParticipants: number | null;
};

export const emptyCatalogFilters: CatalogFilters = {
  formats: [], levels: [], minimumRating: 0,
  minimumParticipants: null, maximumParticipants: null
};

export function getChallengeFormat(challenge: {
  duration?: string;
  durationDays?: number;
  definition?: ChallengeDefinition;
}): ChallengeFormat {
  // Preserve the editorial format, including cumulative one-off challenges.
  if (challenge.duration === "Dauerhaft") return "ongoing";
  if (challenge.duration === "Einmalig" || challenge.definition?.type === "one_time_result") return "once";
  return "period";
}

export function matchesCatalogFilters(challenge: {
  level: ChallengeLevel;
  format: ChallengeFormat;
  rating?: number;
  participants: number;
}, filters: CatalogFilters): boolean {
  return (filters.formats.length === 0 || filters.formats.includes(challenge.format))
    && (filters.levels.length === 0 || filters.levels.includes(challenge.level))
    && (filters.minimumRating === 0 || (challenge.rating ?? 0) >= filters.minimumRating)
    && (filters.minimumParticipants === null || challenge.participants >= filters.minimumParticipants)
    && (filters.maximumParticipants === null || challenge.participants <= filters.maximumParticipants);
}

// First stop includes unrated challenges; subsequent stops are 1–5 in half steps.
export function ratingFromSlider(step: number): number {
  return step === 0 ? 0 : (step + 1) / 2;
}
