import type { Metadata } from "next";
import { ChallengeCreateApp } from "@/components/challenge-create-app";

export const metadata: Metadata = {
  title: "Challenge erstellen | ChallengeHub",
  description: "Erstelle eine eigene oeffentliche Challenge auf ChallengeHub."
};

export default function NewChallengePage() {
  return <ChallengeCreateApp />;
}
