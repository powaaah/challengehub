"use server";

import { redirect } from "next/navigation";
import { type ChallengeLevel } from "@/data/challenges";
import { requireCurrentUser } from "@/lib/auth";
import { createPublishedChallengeForUser } from "@/lib/challenge-creation";

export type CreateChallengeState = {
  error: string;
  duplicates: Array<{ title: string; slug: string }>;
};

const allowedLevels: ChallengeLevel[] = ["User", "Beginner", "Advanced", "Premium"];

export async function createChallengeAction(
  _state: CreateChallengeState,
  formData: FormData
): Promise<CreateChallengeState> {
  const user = await requireCurrentUser();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const level = String(formData.get("level") ?? "User") as ChallengeLevel;
  const durationDays = Number(formData.get("durationDays"));
  const goal = String(formData.get("goal") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rules = parseLines(String(formData.get("rules") ?? ""));
  const tips = parseLines(String(formData.get("tips") ?? ""));

  if (!title || !category || !goal || !description || rules.length === 0) {
    return {
      error: "Titel, Kategorie, Aufgabe, Beschreibung und mindestens eine Regel sind Pflicht.",
      duplicates: []
    };
  }

  if (!allowedLevels.includes(level) || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
    return {
      error: "Bitte wähle einen gültigen Challenge-Typ und eine Dauer zwischen 1 und 365 Tagen.",
      duplicates: []
    };
  }

  const result = createPublishedChallengeForUser({
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
      duplicates: result.matches.map(({ title: matchTitle, slug }) => ({ title: matchTitle, slug }))
    };
  }

  if (result.status !== "created") {
    return {
      error: result.status === "slug_conflict"
        ? "Dieser Challenge-Link ist bereits vergeben. Bitte versuche es erneut."
        : "Dein Account konnte nicht gefunden werden. Bitte melde dich erneut an.",
      duplicates: []
    };
  }

  redirect(`/challenges/${result.slug}`);
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
