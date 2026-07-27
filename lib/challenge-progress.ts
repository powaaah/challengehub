import type { ChallengeRankingCandidate } from "../domain/participations/challenge-participation-stats.ts";

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
  return candidates
    .map((candidate) => ({
      ...candidate,
      ...calculateChallengeProgress({
        startedAt: candidate.startedAt,
        checkInDates: candidate.checkInDates,
        today
      })
    }))
    .sort((left, right) =>
      right.currentStreak - left.currentStreak ||
      right.completionRate - left.completionRate ||
      right.fulfilledDays - left.fulfilledDays ||
      left.startedAt.localeCompare(right.startedAt)
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export function selectChallengeRankingWindow<T extends { id: string }>(
  entries: T[],
  currentParticipationId?: string
) {
  const topEntries = entries.slice(0, 20);
  const currentIndex = currentParticipationId
    ? entries.findIndex((entry) => entry.id === currentParticipationId)
    : -1;

  return {
    topEntries,
    nearbyEntries: currentIndex >= 20
      ? entries.slice(Math.max(20, currentIndex - 2), currentIndex + 3)
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
