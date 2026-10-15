import { SiteFooter, SiteHeader } from "./site-shell";
import { ChallengeHero } from "./challenge-hero";
import { ChallengeInvitationAcceptance } from "./challenge-invitation-acceptance";
import { ChallengeRankingTable } from "./challenge-ranking-table";
import type { ChallengeActivityEntry } from "@/domain/participations/challenge-participation-stats";
import type { CurrentUser } from "@/lib/auth";
import type { ChallengeRankingEntry } from "@/lib/challenge-progress";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
import { formatMetricValue } from "@/domain/challenges/challenge-outcome";
import { buildChallengeBreadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import styles from "./user-challenge-detail.module.css";

export function DbChallengeDetail({
  challenge,
  ranking,
  activity,
  currentParticipationId,
  participantCount,
  user,
  invitationToken,
  invitationChallengeSlug
}: {
  challenge: PublicChallenge;
  ranking: ChallengeRankingEntry[];
  activity: ChallengeActivityEntry[];
  currentParticipationId?: string;
  participantCount: number;
  user: CurrentUser | null;
  invitationToken?: string;
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
  const isDailyChallenge = challenge.definition.type === "daily_boolean";

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
        participantCount={participantCount}
      />

      <section className={styles.detailRanking} data-detail-section="ranking" aria-labelledby="community-ranking">
        <div className={styles.detailSectionHeader}>
          <div>
            <p className={styles.eyebrow}>Ranking</p>
            <h2 id="community-ranking">Top 5</h2>
          </div>
          <p>
            {isDailyChallenge
              ? "Wer hält am längsten durch?"
              : "Die besten gemessenen Ergebnisse."}
          </p>
        </div>
        <ChallengeRankingTable
          entries={ranking}
          currentParticipationId={currentParticipationId}
          collapsedLimit={5}
        />
      </section>

      <section className={styles.detailActivity} data-detail-section="activity" aria-labelledby="community-activity">
        <div className={styles.detailSectionHeader}>
          <div>
            <p className={styles.eyebrow}>Live aus der Challenge</p>
            <h2 id="community-activity">Letzte Aktivitäten</h2>
          </div>
          <p>Echte Check-ins, keine simulierten Meldungen.</p>
        </div>
        {activity.length > 0 ? (
          <ol className={styles.detailActivityList}>
            {activity.map((entry) => (
              <li key={entry.id}>
                <strong>{entry.participantName}</strong>
                <span>
                  Check-in am <time dateTime={entry.checkInDate}>{formatActivityDate(entry.checkInDate)}</time>
                  {entry.value !== null && challenge.definition.type !== "daily_boolean"
                    ? ` · ${formatMetricValue(entry.value, challenge.definition.unit)}`
                    : null}
                </span>
              </li>
            ))}
          </ol>
        ) : <p className={styles.detailEmpty}>Noch wurden keine Check-ins gespeichert.</p>}
      </section>

      <section className={styles.detailSeo} data-detail-section="seo">
        <p className={styles.eyebrow}>Tipps</p>
        <h2>So wird die Challenge machbar</h2>
        {challenge.tips.length > 0 ? (
          <ul>
            {challenge.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p>Starte klein, plane deinen Check-in fest ein und halte die Tagesregel eindeutig.</p>
        )}
        <p className={styles.detailCreator}>Erstellt von {challenge.creatorName}</p>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin"
  }).format(new Date(`${date}T12:00:00.000Z`));
}
