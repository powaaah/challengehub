import { ChallengeHubApp } from "@/components/challenge-hub-app";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationCountsByChallengeSlug } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const participantCounts = getParticipationCountsByChallengeSlug();

  return <ChallengeHubApp participantCounts={participantCounts} user={user} />;
}
