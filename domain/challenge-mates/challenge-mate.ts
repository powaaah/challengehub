export const CHALLENGE_MATE_MODES = ["remote", "local"] as const;
export const CHALLENGE_MATE_REPORT_REASONS = ["spam", "inappropriate", "safety", "other"] as const;

export type ChallengeMateMode = (typeof CHALLENGE_MATE_MODES)[number];
export type ChallengeMateReportReason = (typeof CHALLENGE_MATE_REPORT_REASONS)[number];

export type ChallengeMateProfile = {
  userId: string;
  participationId: string;
  challengeId: string;
  challengeSlug: string;
  challengeTitle: string;
  userName: string;
  goal: string;
  availableFrom: string;
  availableUntil: string;
  mode: ChallengeMateMode;
  location: string | null;
  active: boolean;
  updatedAt: string;
};

export type ChallengeMateProfileInput = Pick<
  ChallengeMateProfile,
  "participationId" | "goal" | "availableFrom" | "availableUntil" | "mode" | "location"
>;

export type ChallengeMateConnectionView = {
  connectionId: string;
  mateUserId: string;
  mateName: string;
  mateGoal: string;
  challengeSlug: string;
  challengeTitle: string;
  mode: ChallengeMateMode;
  location: string | null;
  createdAt: string;
  matchedAt: string | null;
};

export type ChallengeMateDashboard = {
  profile: ChallengeMateProfile | null;
  suggestions: ChallengeMateProfile[];
  incoming: ChallengeMateConnectionView[];
  outgoing: ChallengeMateConnectionView[];
  matches: ChallengeMateConnectionView[];
};

export function parseChallengeMateProfileInput(input: {
  participationId: string;
  goal: string;
  availableFrom: string;
  availableUntil: string;
  mode: string;
  location: string | null;
}): ChallengeMateProfileInput | null {
  const participationId = input.participationId.trim();
  const goal = input.goal.trim();
  const location = input.location?.trim() || null;
  const mode = CHALLENGE_MATE_MODES.find((value) => value === input.mode);

  if (
    !participationId ||
    goal.length < 20 ||
    Array.from(goal).length > 200 ||
    !isDateKey(input.availableFrom) ||
    !isDateKey(input.availableUntil) ||
    input.availableFrom > input.availableUntil ||
    !mode ||
    (mode === "local" && !location) ||
    (location !== null && Array.from(location).length > 80)
  ) {
    return null;
  }

  return {
    participationId,
    goal,
    availableFrom: input.availableFrom,
    availableUntil: input.availableUntil,
    mode,
    location: mode === "remote" ? null : location
  };
}

export function areChallengeMateProfilesCompatible(
  first: ChallengeMateProfile,
  second: ChallengeMateProfile
) {
  if (
    !first.active ||
    !second.active ||
    first.userId === second.userId ||
    first.challengeId !== second.challengeId ||
    first.availableFrom > second.availableUntil ||
    second.availableFrom > first.availableUntil ||
    first.mode !== second.mode
  ) {
    return false;
  }

  return first.mode === "remote" || normalizeLocation(first.location) === normalizeLocation(second.location);
}

function normalizeLocation(value: string | null) {
  return value?.trim().toLocaleLowerCase("de-DE") ?? "";
}

function isDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
