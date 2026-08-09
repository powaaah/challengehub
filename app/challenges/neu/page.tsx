import type { Metadata } from "next";
import { ChallengeCreateApp } from "@/components/challenge-create-app";
import { getCurrentUser } from "@/lib/auth";
import { createChallengeAction } from "./actions";

export const metadata: Metadata = {
  title: "Challenge erstellen | ChallengeHub",
  description: "Erstelle eine eigene Challenge und reiche sie zur Prüfung bei ChallengeHub ein.",
  robots: { index: false, follow: false }
};

export default async function NewChallengePage() {
  const user = await getCurrentUser();

  return <ChallengeCreateApp createChallenge={createChallengeAction} user={user} />;
}
