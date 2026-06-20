export const activeChallengesStorageKey = "challengehub.activeChallenges.v1";

export type ActiveChallenge = {
  slug: string;
  title: string;
  goal: string;
  duration: string;
  targetDays?: number;
  startedAt: string;
  checkIns: string[];
  safetyAccepted: boolean;
};

export function readActiveChallenges() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(activeChallengesStorageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as ActiveChallenge[]) : [];
  } catch {
    return [];
  }
}

export function writeActiveChallenges(challenges: ActiveChallenge[]) {
  window.localStorage.setItem(activeChallengesStorageKey, JSON.stringify(challenges));
  window.dispatchEvent(new Event("challengehub:active-challenges"));
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function calculateStreak(checkIns: string[], today = todayKey()) {
  const checkedDays = new Set(checkIns);
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);

  while (checkedDays.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function calculateProgress(checkIns: string[], targetDays?: number) {
  if (!targetDays || targetDays <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((new Set(checkIns).size / targetDays) * 100));
}
