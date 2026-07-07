import type { Metadata } from "next";
import { ChallengeCatalogApp, type SortKey } from "@/components/challenge-hub-app";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationCountsByChallengeSlug, getPublishedChallenges } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenges | ChallengeHub",
  description: "Finde kuratierte und oeffentliche Challenges auf ChallengeHub."
};

type ChallengesPageProps = {
  searchParams: Promise<{
    suche?: string;
    sort?: string;
  }>;
};

export default async function ChallengesPage({ searchParams }: ChallengesPageProps) {
  const { suche = "", sort = "standard" } = await searchParams;
  const initialSortKey = getInitialSortKey(sort);
  const serverChallenges = getPublishedChallenges();
  const participantCounts = getParticipationCountsByChallengeSlug();
  const user = await getCurrentUser();

  return (
    <ChallengeCatalogApp
      participantCounts={participantCounts}
      user={user}
      serverChallenges={serverChallenges}
      initialSearchQuery={suche}
      initialSortKey={initialSortKey}
    />
  );
}

function getInitialSortKey(value: string): SortKey {
  return value === "newest" || value === "participants" ? value : "standard";
}
