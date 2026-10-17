import { ChallengeSeoContent } from "./challenge-seo-content";
import { SiteFooter, SiteHeader } from "./site-shell";
import { ChallengeHero } from "./challenge-hero";
import { ChallengeInvitationAcceptance } from "./challenge-invitation-acceptance";
import { ChallengeRankingTable } from "./challenge-ranking-table";
import type { CurrentUser } from "@/lib/auth";
import type { ChallengeRankingEntry } from "@/lib/challenge-progress";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
import { buildChallengeBreadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import styles from "./user-challenge-detail.module.css";

export function DbChallengeDetail({
  challenge,
  ranking,
  currentParticipationId,
  participantCount,
  user,
  invitationToken,
  ownResult,
  invitationChallengeSlug
}: {
  challenge: PublicChallenge;
  ranking: ChallengeRankingEntry[];
  currentParticipationId?: string;
  participantCount: number;
  user: CurrentUser | null;
  invitationToken?: string;
  ownResult?: { completed: boolean; rankingTimeSeconds: number | null };
  invitationChallengeSlug?: string;
}) {
  const pageUrl = `${SITE_URL}/challenges/${challenge.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: challenge.title,
        description: challenge.description,
        datePublished: challenge.createdAt,
        dateModified: challenge.createdAt,
        mainEntityOfPage: pageUrl,
        author: {
          "@type": "Person",
          name: challenge.creatorName
        },
        publisher: {
          "@type": "Organization",
          name: "ChallengeHub"
        }
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#rules`,
        name: `${challenge.title} Regeln`,
        description: challenge.goal,
        step: challenge.rules.map((rule, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: rule
        }))
      },
      buildChallengeBreadcrumbJsonLd(challenge.title, challenge.slug)
    ]
  };

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      {invitationChallengeSlug === challenge.slug ? (
        <ChallengeInvitationAcceptance
          isAuthenticated={Boolean(user)}
          slug={challenge.slug}
          token={invitationToken ?? ""}
        />
      ) : null}
      {invitationToken && invitationChallengeSlug !== challenge.slug ? (
        <p className={styles.invitationError} role="alert">
          {invitationToken === "selbst"
            ? "Du kannst deine eigene Einladung nicht annehmen."
            : "Dieser Einladungslink ist ungültig, abgelaufen oder wurde bereits verwendet."}
        </p>
      ) : null}
      <ChallengeHero
        challenge={{ ...challenge, duration: `${challenge.durationDays} Tage`, targetDays: challenge.durationDays }}
        isAuthenticated={Boolean(user)}
        currentParticipationId={currentParticipationId}
        ownResult={ownResult}
        participantCount={participantCount}
      />

      <section className={styles.detailRanking} data-detail-section="ranking" aria-labelledby="community-ranking">
        <div className={styles.detailSectionHeader}>
          <div>
            <h2 id="community-ranking">Ranking</h2>
          </div>
        </div>
        <ChallengeRankingTable
          entries={ranking}
          currentParticipationId={currentParticipationId}
          collapsedLimit={10}
        />
      </section>

      <ChallengeSeoContent
        challenge={{ ...challenge, duration: `${challenge.durationDays} Tage` }}
        creatorName={challenge.creatorName}
      />
    </main>
    <SiteFooter />
    </>
  );
}
