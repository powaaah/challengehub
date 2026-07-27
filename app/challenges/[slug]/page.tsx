import Link from "next/link";
import type { Metadata } from "next";
import { ChallengeInvitationAcceptance } from "@/components/challenge-invitation-acceptance";
import { ChallengeRankingTable } from "@/components/challenge-ranking-table";
import { ChallengeStart } from "@/components/challenge-start";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { DbChallengeDetail } from "@/components/db-challenge-detail";
import { UserChallengeDetail } from "@/components/user-challenge-detail";
import { challenges, getChallengeBySlug, levelLabels } from "@/data/challenges";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeInvitationPreview } from "@/lib/challenge-invitations";
import {
  getChallengeRankingBySlug,
  getParticipationCountByChallengeSlug,
  getRecentChallengeActivityBySlug
} from "@/lib/challenge-participation-stats";
import { getParticipationsForUser } from "@/lib/participations";
import { getPublishedChallengeBySlug } from "@/lib/public-challenges";
import {
  buildChallengeBreadcrumbJsonLd,
  buildChallengeSocialImageMetadata,
  SITE_URL
} from "@/lib/seo";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type ChallengePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    einladung?: string;
  }>;
};

export function generateStaticParams() {
  return challenges.map((challenge) => ({
    slug: challenge.slug
  }));
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);

  if (!challenge) {
    const communityChallenge = await getPublishedChallengeBySlug(slug);

    if (communityChallenge) {
      const url = `/challenges/${communityChallenge.slug}`;
      const title = `${communityChallenge.title}: Regeln und Challenge | ChallengeHub`;
      const socialImage = buildChallengeSocialImageMetadata(
        communityChallenge.title,
        communityChallenge.slug
      );

      return {
        title,
        description: communityChallenge.description,
        alternates: { canonical: url },
        openGraph: {
          type: "article",
          url,
          title,
          description: communityChallenge.description,
          siteName: "ChallengeHub",
          locale: "de_DE",
          publishedTime: communityChallenge.createdAt,
          tags: [communityChallenge.title, communityChallenge.category, "Challenge"],
          images: [socialImage]
        },
        twitter: {
          card: "summary_large_image",
          title,
          description: communityChallenge.description,
          images: [socialImage.url]
        }
      };
    }

    return {
      title: "Öffentliche Challenge | ChallengeHub",
      description: "Eine von der Community erstellte öffentliche Challenge auf ChallengeHub.",
      robots: { index: false, follow: false }
    };
  }

  const url = `/challenges/${challenge.slug}`;
  const title = `${challenge.title}: Regeln und Ranking | ChallengeHub`;
  const socialImage = buildChallengeSocialImageMetadata(challenge.title, challenge.slug);

  return {
    title,
    description: challenge.seoDescription,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: "article",
      url,
      title,
      description: challenge.seoDescription,
      siteName: "ChallengeHub",
      locale: "de_DE",
      publishedTime: challenge.createdAt,
      tags: [challenge.title, levelLabels[challenge.level], "Challenge", "Ranking"],
      images: [socialImage]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: challenge.seoDescription,
      images: [socialImage.url]
    }
  };
}

export default async function ChallengePage({ params, searchParams }: ChallengePageProps) {
  const { slug } = await params;
  const { einladung } = await searchParams;
  const challenge = getChallengeBySlug(slug);
  const user = await getCurrentUser();
  const invitation = einladung ? getChallengeInvitationPreview(einladung) : null;

  if (!challenge) {
    const dbChallenge = await getPublishedChallengeBySlug(slug);
    if (dbChallenge) {
      return (
        <DbChallengeDetail
          challenge={dbChallenge}
          invitationChallengeSlug={invitation?.challengeSlug}
          invitationToken={einladung}
          participantCount={getParticipationCountByChallengeSlug(dbChallenge.slug)}
          user={user}
        />
      );
    }

    return <UserChallengeDetail slug={slug} user={user} />;
  }

  const pageUrl = `${SITE_URL}/challenges/${challenge.slug}`;
  const ranking = getChallengeRankingBySlug(challenge.slug, getTodayKey());
  const activity = getRecentChallengeActivityBySlug(challenge.slug);
  const currentParticipationId = user
    ? getParticipationsForUser(user.id).find((participation) =>
        participation.challengeSlug === challenge.slug && participation.status === "active"
      )?.id
    : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${pageUrl}#article`,
        headline: challenge.title,
        description: challenge.seoDescription,
        datePublished: challenge.createdAt,
        dateModified: challenge.createdAt,
        mainEntityOfPage: pageUrl,
        author: {
          "@type": "Organization",
          name: "ChallengeHub"
        },
        publisher: {
          "@type": "Organization",
          name: "ChallengeHub",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`
          }
        },
        about: [challenge.goal, levelLabels[challenge.level], challenge.duration]
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#rules`,
        name: `${challenge.title} Regeln`,
        description: challenge.description,
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
      <main className={styles.page}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
          }}
        />

        {invitation?.challengeSlug === challenge.slug ? (
          <ChallengeInvitationAcceptance
            isAuthenticated={Boolean(user)}
            slug={challenge.slug}
            token={einladung ?? ""}
          />
        ) : null}

        {einladung && invitation?.challengeSlug !== challenge.slug ? (
          <p className={styles.invitationError} role="alert">
            {einladung === "selbst"
              ? "Du kannst deine eigene Einladung nicht annehmen."
              : "Dieser Einladungslink ist ungültig, abgelaufen oder wurde bereits verwendet."}
          </p>
        ) : null}

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <Link className={styles.backLink} href="/challenges">
              Zurück zu den Challenges
            </Link>
            <p className={styles.level}>Challenge</p>
            <h1>{challenge.title}</h1>
            <p className={styles.question}>Was ist die Challenge?</p>
            <p className={styles.description}>
              {challenge.description}
            </p>
            <div className={styles.heroActions}>
              <ChallengeStart
                challenge={challenge}
                isAuthenticated={Boolean(user)}
                loginNext={`/challenges/${challenge.slug}`}
              />
              <Link className={styles.secondaryAction} href="/challenge-mate">
                ChallengeMate finden
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.rankingSection} aria-labelledby="challenge-ranking">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Ranking</p>
              <h2 id="challenge-ranking">Top 20</h2>
            </div>
            <p>Wer hält am längsten durch?</p>
          </div>
          <ChallengeRankingTable
            entries={ranking}
            currentParticipationId={currentParticipationId}
          />
        </section>

        <section className={styles.activitySection} aria-labelledby="challenge-activity">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Live aus der Challenge</p>
              <h2 id="challenge-activity">Letzte Aktivitäten</h2>
            </div>
            <p>Echte Check-ins, keine simulierten Meldungen.</p>
          </div>
          {activity.length > 0 ? (
            <ol className={styles.activityList}>
              {activity.map((entry) => (
                <li key={entry.id}>
                  <span className={styles.activityMarker} aria-hidden="true" />
                  <p>
                    <strong>{entry.participantName}</strong> hat die Challenge am{" "}
                    <time dateTime={entry.checkInDate}>{formatActivityDate(entry.checkInDate)}</time>
                    {" "}erfolgreich abgehakt.
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.activityEmpty}>Noch wurden keine Check-ins gespeichert.</p>
          )}
        </section>

        <section className={styles.seoContent} aria-labelledby="challenge-info">
          <div className={styles.textPanel}>
            <p className={styles.eyebrow}>Info</p>
            <h2 id="challenge-info">{challenge.title}: Einordnung und Hinweise</h2>
            <p>
              Auf dieser Seite geht es nicht um einen Trainingsplan, sondern um eine klare Aufgabe:
              Du startest die Challenge, hältst dich an die Regeln und vergleichst deinen Streak
              mit anderen Teilnehmern.
            </p>
            <p>
              Für echte ChallengeMates zählt vor allem, wer bisher wie lange durchgehalten hat.
              Genau diese Werte sollen mit echten Starts und Check-ins sichtbar werden.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin"
  }).format(new Date(`${date}T12:00:00.000Z`));
}
