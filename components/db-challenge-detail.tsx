import Link from "next/link";
import { SiteFooter, SiteHeader } from "./site-shell";
import { ChallengeStart } from "./challenge-start";
import { ChallengeInvitationAcceptance } from "./challenge-invitation-acceptance";
import { ChallengeRankingTable } from "./challenge-ranking-table";
import { levelLabels } from "@/data/challenges";
import type { ChallengeActivityEntry } from "@/domain/participations/challenge-participation-stats";
import type { CurrentUser } from "@/lib/auth";
import type { ChallengeRankingEntry } from "@/lib/challenge-progress";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
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
      <section className={`${styles.hero} ${styles[challenge.level]}`} data-detail-section="hero">
        <Link className={styles.backLink} href="/challenges">
          Zurück zu den Challenges
        </Link>
        <p className={styles.level}>Öffentliche Challenge | {levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
      </section>

      <section className={styles.detailFactsRules} data-detail-section="facts-rules" aria-label="Challenge-Fakten und Regeln">
        <div className={styles.detailFacts}>
          <p className={styles.eyebrow}>Die Aufgabe</p>
          <h2>Auf einen Blick</h2>
          <dl>
            <div><dt>Ziel</dt><dd>{challenge.goal}</dd></div>
            <div><dt>Dauer</dt><dd>{challenge.durationDays} Tage</dd></div>
            <div><dt>Kategorie</dt><dd>{challenge.category}</dd></div>
            {participantCount > 0 ? <div><dt>Teilnahmen</dt><dd>{participantCount}</dd></div> : null}
          </dl>
        </div>
        <div className={styles.detailRules}>
          <p className={styles.eyebrow}>So zählt der Tag</p>
          <h2>Regeln</h2>
          <ol>
            {challenge.rules.map((rule) => <li key={rule}>{rule}</li>)}
          </ol>
        </div>
      </section>

      <section className={styles.detailParticipation} data-detail-section="participation" aria-labelledby="community-participation">
        <div>
          <p className={styles.eyebrow}>Mitmachen</p>
          <h2 id="community-participation">Bereit für die Challenge?</h2>
          <p>Starte deine Teilnahme und halte deine echten Check-ins im Challenge-Raum fest.</p>
        </div>
        <div className={styles.detailActions}>
          <ChallengeStart
            isAuthenticated={Boolean(user)}
            loginNext={`/challenges/${challenge.slug}`}
            challenge={{
              slug: challenge.slug,
              title: challenge.title,
              goal: challenge.goal,
              duration: `${challenge.durationDays} Tage`,
              targetDays: challenge.durationDays
            }}
          />
        </div>
      </section>

      <section className={styles.detailRanking} data-detail-section="ranking" aria-labelledby="community-ranking">
        <div className={styles.detailSectionHeader}>
          <div>
            <p className={styles.eyebrow}>Ranking</p>
            <h2 id="community-ranking">Top 5</h2>
          </div>
          <p>Wer hält am längsten durch?</p>
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
