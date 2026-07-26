import type { Metadata } from "next";
import { ChallengeCatalogApp, type SortKey } from "@/components/challenge-hub-app";
import { challenges } from "@/data/challenges";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationCountsByChallengeSlug } from "@/lib/challenge-participation-stats";
import { getPublishedChallenges } from "@/lib/public-challenges";
import { buildChallengeCatalogJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenges | ChallengeHub",
  description: "Finde kuratierte und öffentliche Challenges auf ChallengeHub.",
  alternates: {
    canonical: "/challenges"
  },
  openGraph: {
    type: "website",
    url: "/challenges",
    title: "Challenges | ChallengeHub",
    description: "Finde kuratierte und öffentliche Challenges auf ChallengeHub."
  }
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
  const serverChallenges = await getPublishedChallenges();
  const participantCounts = getParticipationCountsByChallengeSlug();
  const user = await getCurrentUser();
  const catalogJsonLd = buildChallengeCatalogJsonLd([
    ...challenges.map(({ slug, title }) => ({ slug, title })),
    ...serverChallenges.map(({ slug, title }) => ({ slug, title }))
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(catalogJsonLd).replace(/</g, "\\u003c")
        }}
      />
      <ChallengeCatalogApp
        participantCounts={participantCounts}
        user={user}
        serverChallenges={serverChallenges}
        initialSearchQuery={suche}
        initialSortKey={initialSortKey}
      />
    </>
  );
}

function getInitialSortKey(value: string): SortKey {
  return value === "newest" || value === "participants" ? value : "standard";
}
