import type { ChallengeRankingCandidate } from "../domain/participations/challenge-participation-stats.ts";
import { calculateChallengeOutcome } from "../domain/challenges/challenge-outcome.ts";

const millisecondsPerDay = 86_400_000;

export type ChallengeProgress = {
  elapsedDays: number;
  fulfilledDays: number;
  missedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  hasCheckedInToday: boolean;
  lastCheckInDate: string | null;
};

export type ChallengeHistoryDay = {
  date: string;
  status: "fulfilled" | "missed" | "open";
};

export type ChallengeRankingEntry = ChallengeRankingCandidate & ChallengeProgress & {
  rank: number;
  scoreValue: number;
  scoreLabel: string;
};

export function buildChallengeHistory(input: {
  startedAt: string;
  checkInDates: string[];
  today: string;
  days?: number;
}): ChallengeHistoryDay[] {
  const startDate = input.startedAt.slice(0, 10);
  const windowDays = Math.max(1, Math.trunc(input.days ?? 84));
  const windowStart = addDays(input.today, -(windowDays - 1));
  const firstDate = startDate > windowStart ? startDate : windowStart;
  const checkInDates = new Set(
    input.checkInDates.filter((date) => date >= firstDate && date <= input.today)
  );
  const history: ChallengeHistoryDay[] = [];

  for (let date = firstDate; date <= input.today; date = addDays(date, 1)) {
    history.push({
      date,
      status: checkInDates.has(date) ? "fulfilled" : date === input.today ? "open" : "missed"
    });
  }

  return history;
}

export function calculateChallengeProgress(input: {
  startedAt: string;
  checkInDates: string[];
  today: string;
}): ChallengeProgress {
  const startDate = input.startedAt.slice(0, 10);
  const elapsedDays = Math.max(daysBetween(startDate, input.today) + 1, 1);
  const dates = Array.from(new Set(input.checkInDates))
    .filter((date) => date >= startDate && date <= input.today)
    .sort();
  const dateSet = new Set(dates);
  const fulfilledDays = dates.length;
  const hasCheckedInToday = dateSet.has(input.today);

  return {
    elapsedDays,
    fulfilledDays,
    missedDays: Math.max(elapsedDays - fulfilledDays, 0),
    completionRate: Math.round((fulfilledDays / elapsedDays) * 100),
    currentStreak: calculateCurrentStreak(dateSet, input.today, hasCheckedInToday),
    longestStreak: calculateLongestStreak(dates),
    hasCheckedInToday,
    lastCheckInDate: dates.length > 0 ? dates[dates.length - 1] : null
  };
}

export function rankChallengeParticipants(
  candidates: ChallengeRankingCandidate[],
  today: string
): ChallengeRankingEntry[] {
  assertCompatibleRankingDefinitions(candidates);
  return candidates
    .map((candidate) => {
      const progress = calculateChallengeProgress({
        startedAt: candidate.startedAt,
        checkInDates: candidate.checkIns.map((checkIn) => checkIn.date),
        today
      });
      const outcome = calculateChallengeOutcome({
        definition: candidate.definition,
        checkIns: candidate.checkIns
      });
      const isDaily = candidate.definition.type === "daily_boolean";
      return {
        ...candidate,
        ...progress,
        completionRate: isDaily ? progress.completionRate : outcome.completionRate,
        scoreValue: isDaily ? progress.currentStreak : outcome.value,
        scoreLabel: isDaily
          ? `${progress.currentStreak} ${progress.currentStreak === 1 ? "Tag" : "Tage"}`
          : outcome.label
      };
    })
    .sort(compareRankingEntries)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function compareRankingEntries(
  left: Omit<ChallengeRankingEntry, "rank">,
  right: Omit<ChallengeRankingEntry, "rank">
) {
  const definition = left.definition;
  if (definition.type === "daily_boolean") {
    return right.currentStreak - left.currentStreak ||
      right.completionRate - left.completionRate ||
      right.fulfilledDays - left.fulfilledDays ||
      left.startedAt.localeCompare(right.startedAt);
  }

  const leftHasValue = left.checkIns.some((checkIn) => checkIn.value !== null);
  const rightHasValue = right.checkIns.some((checkIn) => checkIn.value !== null);
  if (leftHasValue !== rightHasValue) {
    return leftHasValue ? -1 : 1;
  }
  const valueComparison = definition.direction === "at_most"
    ? left.scoreValue - right.scoreValue
    : right.scoreValue - left.scoreValue;
  return valueComparison || left.startedAt.localeCompare(right.startedAt);
}

function assertCompatibleRankingDefinitions(candidates: ChallengeRankingCandidate[]) {
  const firstDefinition = candidates[0]?.definition;
  if (!firstDefinition) {
    return;
  }
  const signature = JSON.stringify(firstDefinition);
  if (candidates.some((candidate) => JSON.stringify(candidate.definition) !== signature)) {
    throw new Error("Ranking-Kandidaten verschiedener Typen dürfen nicht verglichen werden.");
  }
}

export function selectChallengeRankingWindow<T extends { id: string }>(
  entries: T[],
  currentParticipationId?: string,
  visibleLimit = 20
) {
  const safeVisibleLimit = Math.min(Math.max(1, Math.trunc(visibleLimit)), 20);
  const topEntries = entries.slice(0, safeVisibleLimit);
  const currentIndex = currentParticipationId
    ? entries.findIndex((entry) => entry.id === currentParticipationId)
    : -1;

  return {
    topEntries,
    nearbyEntries: currentIndex >= safeVisibleLimit
      ? entries.slice(Math.max(safeVisibleLimit, currentIndex - 2), currentIndex + 3)
      : []
  };
}

function calculateCurrentStreak(dateSet: Set<string>, today: string, hasCheckedInToday: boolean) {
  let cursor = hasCheckedInToday ? today : addDays(today, -1);
  let streak = 0;

  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function calculateLongestStreak(dates: string[]) {
  let longest = 0;
  let current = 0;
  let previous: string | null = null;

  for (const date of dates) {
    current = previous && daysBetween(previous, date) === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}

function daysBetween(from: string, to: string) {
  return Math.floor((dateKeyToTimestamp(to) - dateKeyToTimestamp(from)) / millisecondsPerDay);
}

function addDays(date: string, amount: number) {
  return new Date(dateKeyToTimestamp(date) + amount * millisecondsPerDay).toISOString().slice(0, 10);
}

function dateKeyToTimestamp(date: string) {
  return Date.parse(`${date}T00:00:00.000Z`);
}
