import type { Metadata } from "next";
import { MyChallengesApp } from "@/components/my-challenges-app";

export const metadata: Metadata = {
  title: "Meine Challenges | ChallengeHub",
  description: "Deine lokal gestarteten Challenges, heutige Check-ins und Streaks.",
  alternates: {
    canonical: "/meine-challenges"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function MyChallengesPage() {
  return <MyChallengesApp />;
}
