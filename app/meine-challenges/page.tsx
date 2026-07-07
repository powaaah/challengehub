import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyChallengesApp } from "@/components/my-challenges-app";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationsForUser } from "@/lib/db";

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

export const dynamic = "force-dynamic";

export default async function MyChallengesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  const participations = getParticipationsForUser(user.id);

  return <MyChallengesApp user={user} participations={participations} />;
}
