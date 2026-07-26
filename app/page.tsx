import type { Metadata } from "next";
import { ChallengeHubApp } from "@/components/challenge-hub-app";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationCountsByChallengeSlug } from "@/lib/challenge-participation-stats";
import { buildHomePageJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ChallengeHub - Reach. Your. Goals.",
  description: "Finde Challenges, starte neue Gewohnheiten und erreiche Ziele gemeinsam.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "ChallengeHub - Reach. Your. Goals.",
    description: "Finde Challenges, starte neue Gewohnheiten und erreiche Ziele gemeinsam."
  }
};

export default async function Home() {
  const user = await getCurrentUser();
  const participantCounts = getParticipationCountsByChallengeSlug();
  const jsonLd = buildHomePageJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <ChallengeHubApp participantCounts={participantCounts} user={user} />
    </>
  );
}
