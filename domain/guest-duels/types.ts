import type { ChallengeDefinition } from "../challenges/competition-definition.ts";
export type DuelSource = {
  sourceKey: string;
  title: string;
  goal: string;
  rules: string[];
  definition: ChallengeDefinition;
  durationDays: number | null;
};
export type DuelEntry = { id: string; at: string; value: number | null };
export type DuelView = {
  id: string;
  source: DuelSource;
  durationDays: number;
  status: "lobby" | "active" | "completed";
  startedAt: string | null;
  endsAt: string | null;
  owner: boolean;
  me: string;
  members: {
    id: string;
    name: string;
    finished: boolean;
    value: number;
    label: string;
    entries: DuelEntry[];
  }[];
  result: { winnerId: string | null; tie: boolean } | null;
};
