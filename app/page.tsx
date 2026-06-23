import { ChallengeHubApp } from "@/components/challenge-hub-app";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  return <ChallengeHubApp user={user} />;
}
