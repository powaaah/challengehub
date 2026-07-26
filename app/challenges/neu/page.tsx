import type { Metadata } from "next";
import { ChallengeCreateApp } from "@/components/challenge-create-app";
import { getCurrentUser } from "@/lib/auth";
import { createChallengeAction } from "./actions";

export const metadata: Metadata = {
  title: "Challenge erstellen | ChallengeHub",
  description: "Erstelle eine eigene öffentliche Challenge auf ChallengeHub."
};

export default async function NewChallengePage() {
  const user = await getCurrentUser();

  return <ChallengeCreateApp createChallenge={createChallengeAction} user={user} />;
}
