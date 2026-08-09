"use server";

import { type ChallengeLevel } from "@/data/challenges";
import { isRawChallengeInputWithinLimits, validateChallengeInput } from "@/domain/security/input-limits";
import { requireCurrentUser } from "@/lib/auth";
import { submitChallengeForReview } from "@/lib/challenge-creation";
import { allowRateLimitedAction, RATE_LIMIT_POLICIES } from "@/lib/rate-limit";

export type CreateChallengeState = {
  error: string;
  duplicates: Array<{ title: string; slug: string }>;
  submitted: boolean;
};

const allowedLevels: ChallengeLevel[] = ["User"];
const idleState: Pick<CreateChallengeState, "duplicates" | "submitted"> = {
  duplicates: [],
  submitted: false
};

export async function createChallengeAction(
  _state: CreateChallengeState,
  formData: FormData
): Promise<CreateChallengeState> {
  const user = await requireCurrentUser();
  const rawInput = {
    title: String(formData.get("title") ?? ""),
    category: String(formData.get("category") ?? ""),
    goal: String(formData.get("goal") ?? ""),
    description: String(formData.get("description") ?? ""),
    rules: String(formData.get("rules") ?? ""),
    tips: String(formData.get("tips") ?? "")
  };
  if (!isRawChallengeInputWithinLimits(rawInput)) {
    return {
      error: "Mindestens ein Feld überschreitet die erlaubten Textgrenzen.",
      ...idleState
    };
  }

  const title = rawInput.title.trim();
  const category = rawInput.category.trim();
  const level = String(formData.get("level") ?? "User") as ChallengeLevel;
  const durationDays = Number(formData.get("durationDays"));
  const goal = rawInput.goal.trim();
  const description = rawInput.description.trim();
  const rules = parseLines(rawInput.rules);
  const tips = parseLines(rawInput.tips);

  if (!title || !category || !goal || !description || rules.length === 0) {
    return {
      error: "Titel, Kategorie, Aufgabe, Beschreibung und mindestens eine Regel sind Pflicht.",
      ...idleState
    };
  }

  if (!validateChallengeInput({ title, category, goal, description, rules, tips }).valid) {
    return {
      error: "Mindestens ein Feld überschreitet die erlaubten Textgrenzen.",
      ...idleState
    };
  }

  if (!allowedLevels.includes(level) || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
    return {
      error: "Bitte wähle einen gültigen Challenge-Typ und eine Dauer zwischen 1 und 365 Tagen.",
      ...idleState
    };
  }

  if (!allowRateLimitedAction([
    { policy: RATE_LIMIT_POLICIES.challengeCreate, identifier: user.id }
  ])) {
    return {
      error: "Du hast heute bereits zu viele Challenges erstellt. Bitte versuche es später erneut.",
      ...idleState
    };
  }

  const result = submitChallengeForReview({
    creatorId: user.id,
    title,
    level,
    category,
    durationDays,
    goal,
    description,
    rules,
    tips
  });

  if (result.status === "potential_duplicate") {
    return {
      error: "Diese Idee gibt es möglicherweise schon. Prüfe die bestehende Challenge oder formuliere deinen Titel eindeutiger.",
      duplicates: result.matches.map(({ title: matchTitle, slug }) => ({ title: matchTitle, slug })),
      submitted: false
    };
  }

  if (result.status !== "created") {
    return {
      error: result.status === "slug_conflict"
        ? "Dieser Challenge-Link ist bereits vergeben. Bitte versuche es erneut."
        : "Dein Account konnte nicht gefunden werden. Bitte melde dich erneut an.",
      ...idleState
    };
  }

  return { error: "", duplicates: [], submitted: true };
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
