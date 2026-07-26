import { randomUUID } from "node:crypto";
import { challenges, type ChallengeLevel } from "../data/challenges.ts";
import {
  findChallengeDuplicates,
  type ChallengeDuplicateMatch
} from "../domain/challenges/challenge-duplicates.ts";
import type {
  ChallengeWriteRepository,
  CreatePublishedChallengeResult
} from "../domain/challenges/challenge-write-repository.ts";
import { SqliteChallengeWriteRepository } from "../infrastructure/sqlite/sqlite-challenge-write-repository.ts";
import { getDb } from "./db.ts";
import { createSlug } from "./slug.ts";

type CreateChallengeForUserInput = {
  creatorId: string;
  title: string;
  level: ChallengeLevel;
  category: string;
  durationDays: number;
  goal: string;
  description: string;
  rules: string[];
  tips: string[];
};

export type CreateChallengeForUserResult =
  | CreatePublishedChallengeResult
  | { status: "potential_duplicate"; matches: ChallengeDuplicateMatch[] };

function getChallengeWriteRepository(): ChallengeWriteRepository {
  return new SqliteChallengeWriteRepository(getDb());
}

export function createPublishedChallengeForUser(
  input: CreateChallengeForUserInput
): CreateChallengeForUserResult {
  const repository = getChallengeWriteRepository();
  const proposedSlug = createSlug(input.title, []);
  const duplicateMatches = findChallengeDuplicates(input.title, proposedSlug, [
    ...challenges.map(({ title, slug }) => ({ title, slug })),
    ...repository.listPublishedChallenges()
  ]);

  if (duplicateMatches.length > 0) {
    return { status: "potential_duplicate", matches: duplicateMatches };
  }

  const existingSlugs = [
    ...challenges.map((challenge) => challenge.slug),
    ...repository.listSlugs()
  ];
  const slug = createSlug(input.title, existingSlugs);

  return repository.createPublished({
    id: randomUUID(),
    ...input,
    slug
  });
}
