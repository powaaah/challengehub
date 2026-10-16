import type { ChallengeDefinition } from "./challenge-definition.ts";

export function supportsOptionalCompletionTime(
  definition: ChallengeDefinition,
) {
  return (
    definition.type === "one_time_result" &&
    definition.unit !== "seconds" &&
    definition.unit !== "minutes"
  );
}

export function formatRankingTime(seconds: number) {
  const rounded = Math.round(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const rest = String(rounded % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest} h`
    : `${minutes}:${rest} min`;
}
