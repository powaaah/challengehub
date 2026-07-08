"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { challenges, type ChallengeLevel } from "@/data/challenges";
import { requireCurrentUser } from "@/lib/auth";
import { createPublicChallenge, getExistingChallengeSlugs } from "@/lib/db";
import { createSlug } from "@/lib/slug";

export type CreateChallengeState = {
  error: string;
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
      error: "Titel, Kategorie, Aufgabe, Beschreibung und mindestens eine Regel sind Pflicht."
    };
  }

  if (!allowedLevels.includes(level) || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
    return {
      error: "Bitte waehle einen gueltigen Challenge-Typ und eine Dauer zwischen 1 und 365 Tagen."
    };
  }

  const existingSlugs = [...challenges.map((challenge) => challenge.slug), ...getExistingChallengeSlugs()];
  const slug = createSlug(title, existingSlugs);

  createPublicChallenge({
    id: randomUUID(),
    creatorId: user.id,
    slug,
    title,
    level,
    category,
    durationDays,
    goal,
    description,
    rules,
    tips
  });

  redirect(`/challenges/${slug}`);
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
