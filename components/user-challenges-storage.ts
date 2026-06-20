"use client";

import type { ChallengeLevel } from "@/data/challenges";

export const userChallengesStorageKey = "challengehub.userChallenges.v1";

export type UserChallenge = {
  slug: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  durationDays: number;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
  createdAt: string;
};

export function readUserChallenges() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(userChallengesStorageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as UserChallenge[]) : [];
  } catch {
    return [];
  }
}

export function writeUserChallenges(challenges: UserChallenge[]) {
  window.localStorage.setItem(userChallengesStorageKey, JSON.stringify(challenges));
  window.dispatchEvent(new Event("challengehub:user-challenges"));
}

export function createSlug(title: string, existingSlugs: string[]) {
  const baseSlug =
    title
      .toLowerCase()
      .replaceAll("ä", "ae")
      .replaceAll("ö", "oe")
      .replaceAll("ü", "ue")
      .replaceAll("ß", "ss")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "challenge";

  let slug = baseSlug;
  let counter = 2;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export function subscribeToUserChallenges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("challengehub:user-challenges", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("challengehub:user-challenges", onStoreChange);
  };
}
