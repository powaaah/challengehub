import { ChallengeHubApp } from "@/components/challenge-hub-app";
import { getPublishedChallenges } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Home() {
  const serverChallenges = getPublishedChallenges();

  return <ChallengeHubApp serverChallenges={serverChallenges} />;
}
