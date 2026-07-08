import Link from "next/link";
import type { Metadata } from "next";
import { ChallengeRankingTable } from "@/components/challenge-ranking-table";
import { ChallengeStart } from "@/components/challenge-start";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { DbChallengeDetail } from "@/components/db-challenge-detail";
import { UserChallengeDetail } from "@/components/user-challenge-detail";
import { challenges, getChallengeBySlug, levelLabels } from "@/data/challenges";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationCountByChallengeSlug, getPublishedChallengeBySlug } from "@/lib/db";
import styles from "./page.module.css";

const siteUrl = "https://challengehub.de";
const firstServerChallengeSlug = "10000-schritte-am-tag";

export const dynamic = "force-dynamic";

type ChallengePageProps = {
  params: Promise<{
    slug: string;
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
    return {
      title: "Oeffentliche Challenge | ChallengeHub",
      description: "Eine von der Community erstellte oeffentliche Challenge auf ChallengeHub."
    };
  }

  const url = `/challenges/${challenge.slug}`;
  const title = `${challenge.title}: Regeln und Ranking | ChallengeHub`;

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
      tags: [challenge.title, levelLabels[challenge.level], "Challenge", "Ranking"]
    },
    twitter: {
      card: "summary",
      title,
      description: challenge.seoDescription
    }
  };
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { slug } = await params;
  const challenge = getChallengeBySlug(slug);
  const user = await getCurrentUser();

  if (!challenge) {
    const dbChallenge = getPublishedChallengeBySlug(slug);
    if (dbChallenge) {
      return (
        <DbChallengeDetail
          challenge={dbChallenge}
          participantCount={getParticipationCountByChallengeSlug(dbChallenge.slug)}
          user={user}
        />
      );
    }

    return <UserChallengeDetail slug={slug} user={user} />;
  }

  const pageUrl = `${siteUrl}/challenges/${challenge.slug}`;
  const participantCount = getParticipationCountByChallengeSlug(challenge.slug);
  const isServerStartAvailable = challenge.slug === firstServerChallengeSlug;
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
            url: `${siteUrl}/logo.png`
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
      }
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

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <Link className={styles.backLink} href="/challenges">
              Zurueck zu den Challenges
            </Link>
            <p className={styles.level}>Challenge</p>
            <h1>{challenge.title}</h1>
            <p className={styles.description}>
              Miss dich mit anderen, halte deinen Streak und zeig, wie lange du durchziehst.
            </p>
            <div className={styles.heroActions}>
              <ChallengeStart
                challenge={challenge}
                isAuthenticated={Boolean(user)}
                isAvailable={isServerStartAvailable}
                loginNext={`/challenges/${challenge.slug}`}
              />
              <Link className={styles.secondaryAction} href="/challenge-mate">
                ChallengeMate finden
              </Link>
            </div>
            {!isServerStartAvailable && (
              <p className={styles.unavailableNote}>
                Der echte Teilnahme-Flow ist aktuell nur fuer die 10.000-Schritte-Challenge aktiv.
              </p>
            )}
          </div>

          <aside className={styles.heroAside} aria-label="Challenge Stand">
            <span>Teilnehmer</span>
            <strong>{participantCount}</strong>
            <small>Wer haelt am laengsten durch?</small>
          </aside>
        </section>

        <section className={styles.rulesSection} aria-labelledby="challenge-rules">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Regeln</p>
            <h2 id="challenge-rules">{challenge.goal}</h2>
            <p>{challenge.description}</p>
          </div>
          <div className={styles.rulesList}>
            <p className={styles.eyebrow}>Regeln</p>
            <ol>
              {challenge.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.rankingSection} aria-labelledby="challenge-ranking">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Ranking</p>
            <h2 id="challenge-ranking">Top 10</h2>
            <p>Die wichtigste Frage: Wer hat bisher wie lange durchgehalten?</p>
          </div>
          <ChallengeRankingTable
            challenge={{
              participants: participantCount
            }}
          />
        </section>

        <section className={styles.seoContent} aria-labelledby="challenge-info">
          <div className={styles.textPanel}>
            <p className={styles.eyebrow}>Info</p>
            <h2 id="challenge-info">{challenge.title}: Einordnung und Hinweise</h2>
            <p>
              Auf dieser Seite geht es nicht um einen Trainingsplan, sondern um eine klare Aufgabe:
              Du startest die Challenge, haeltst dich an die Regeln und vergleichst deinen Streak
              mit anderen Teilnehmern.
            </p>
            <p>
              Fuer echte ChallengeMates zaehlt vor allem, wer bisher wie lange durchgehalten hat.
              Genau diese Werte sollen mit echten Starts und Check-ins sichtbar werden.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
