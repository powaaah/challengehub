import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChallengeStart } from "@/components/challenge-start";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { DbChallengeDetail } from "@/components/db-challenge-detail";
import {
  StepsChallengeTools,
  StepsKnowledgeSection
} from "@/components/steps-challenge-tools";
import { UserChallengeDetail } from "@/components/user-challenge-detail";
import { challenges, getChallengeBySlug, levelLabels, type Challenge } from "@/data/challenges";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedChallengeBySlug } from "@/lib/db";
import styles from "./page.module.css";

const siteUrl = "https://challengehub.de";
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
  const title = `${challenge.title}: Ziel, Regeln und Tipps | ChallengeHub`;

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
      tags: [challenge.title, levelLabels[challenge.level], "Challenge", "Ziele erreichen"]
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
      return <DbChallengeDetail challenge={dbChallenge} user={user} />;
    }

    return <UserChallengeDetail slug={slug} user={user} />;
  }

  const pageUrl = `${siteUrl}/challenges/${challenge.slug}`;
  const isStepsChallenge = challenge.slug === "10000-schritte-am-tag";
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
        "@id": `${pageUrl}#howto`,
        name: `${challenge.title} starten`,
        description: challenge.description,
        step: challenge.rules.map((rule, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text: rule
        }))
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#benefits`,
        name: `Positive Effekte von ${challenge.title}`,
        itemListElement: (challenge.benefits ?? []).map((benefit, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: benefit.title,
          description: benefit.text,
          url: benefit.source.url
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
      <section className={`${styles.hero} ${styles[challenge.level]}`}>
        <div className={styles.heroMain}>
        <Link className={styles.backLink} href="/challenges">
          Zurück zu den Challenges
        </Link>
        <p className={styles.level}>{levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
        <div className={styles.heroActions}>
          <ChallengeStart challenge={challenge} />
          <p>
            {isStepsChallenge
              ? "Heute starten, Schritte vollmachen, Streak halten."
              : "Jetzt teilnehmen und deinen Fortschritt unter Meine Challenges tracken."}
          </p>
        </div>
        <div className={styles.metrics} aria-label="Challenge Kennzahlen">
          <span>
            <Image src="/images/icon_participants.png" width={24} height={24} alt="" />
            {challenge.participants} Teilnehmer
          </span>
          <span>
            <Image src="/images/icon_stern.png" width={24} height={24} alt="" />
            {challenge.rating.toFixed(1)}/5 Bewertung
          </span>
          <span>{challenge.duration}</span>
        </div>
        </div>
        <ChallengeRankingPanel challenge={challenge} />
      </section>

      <ChallengeStatsBand challenge={challenge} />

      <section className={styles.pulseGrid} aria-label="Challenge Aktivität">
        <RealChallengeMatePanel />
      </section>

      <section className={styles.content}>
        <div className={styles.primaryPanel}>
          <p className={styles.eyebrow}>Ziel</p>
          <h2>{challenge.goal}</h2>
          {isStepsChallenge ? (
            <p>
              Das Prinzip ist absichtlich einfach: Du schaust auf deinen Tagesstand und
              machst die 10.000 voll. Wenn abends noch 2.000 Schritte fehlen, gehst du
              eben noch eine Runde. Genau darin steckt die Challenge.
            </p>
          ) : (
            <p>
              Nimm dir die Challenge bewusst vor, dokumentiere deinen Fortschritt und teile
              Zwischenschritte mit Menschen, die dich motivieren. ChallengeHub soll aus einem
              Ziel eine verbindliche, sichtbare Aufgabe machen.
            </p>
          )}
        </div>

        <aside className={styles.rulesPanel}>
          <p className={styles.eyebrow}>Regeln</p>
          <ol>
            {challenge.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          <div className={styles.safetyNotice}>
            <strong>Sicherheit zuerst.</strong>
            <p>
              Die Inhalte ersetzen keine medizinische Beratung. Prüfe vor intensiven
              Challenges deine Voraussetzungen und brich bei Schmerzen, Schwindel oder
              Unwohlsein ab.
            </p>
            <Link href="/sicherheit">Sicherheitshinweise lesen</Link>
          </div>
          <ChallengeStart challenge={challenge} />
        </aside>
      </section>

      {isStepsChallenge && (
        <>
          <StepsChallengeTools />
          <StepsKnowledgeSection />
        </>
      )}

      {!isStepsChallenge && (challenge.benefits || challenge.stack || challenge.plan) && (
        <section className={styles.evidenceSection} aria-labelledby="challenge-effects">
          {challenge.benefits && (
            <div className={styles.textPanel}>
              <p className={styles.eyebrow}>Wissenschaft</p>
              <h2 id="challenge-effects">Warum diese Challenge etwas veraendern kann</h2>
              <div className={styles.benefitList}>
                {challenge.benefits.map((benefit) => (
                  <article key={benefit.title}>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                    <a href={benefit.source.url} target="_blank" rel="noreferrer">
                      Quelle: {benefit.source.label}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          )}

          {challenge.stack && (
            <div className={styles.textPanel}>
              <p className={styles.eyebrow}>Challenge Stack</p>
              <h2>Die Bausteine</h2>
              <div className={styles.stackGrid}>
                {challenge.stack.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {challenge.plan && (
            <div className={styles.textPanel}>
              <p className={styles.eyebrow}>Plan</p>
              <h2>{challenge.plan.title}</h2>
              <p>{challenge.plan.intro}</p>
              <div className={styles.planList}>
                {challenge.plan.weeks.map((week) => (
                  <article key={week.label}>
                    <span>{week.label}</span>
                    <h3>{week.focus}</h3>
                    <ul>
                      {week.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section
        className={`${styles.seoContent} ${isStepsChallenge ? styles.stepsSeoContent : ""}`}
        aria-labelledby="challenge-tipps"
      >
        <div className={styles.textPanel}>
          <p className={styles.eyebrow}>Tipps</p>
          <h2 id="challenge-tipps">
            {isStepsChallenge ? "So machst du die 10.000 voll" : "So wird die Challenge machbar"}
          </h2>
          <ul>
            {challenge.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}

function ChallengeStatsBand({ challenge }: { challenge: Challenge }) {
  const hasCatalogParticipants = challenge.participants > 0;
  const items = [
    {
      label: "Gestartet",
      value: hasCatalogParticipants ? challenge.participants.toString() : "0",
      note: hasCatalogParticipants ? "Teilnehmer" : "noch keine Starts"
    },
    {
      label: "30 Tage geschafft",
      value: "-",
      note: "noch nicht erfasst"
    },
    {
      label: "180 Tage geschafft",
      value: "-",
      note: "noch nicht erfasst"
    },
    {
      label: "1 Jahr geschafft",
      value: "-",
      note: "noch nicht erfasst"
    }
  ];

  return (
    <section className={styles.statsBand} aria-label="Teilnahme und Durchhaltequoten">
      {items.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </article>
      ))}
    </section>
  );
}

function ChallengeRankingPanel({ challenge }: { challenge: Challenge }) {
  return (
    <article className={`${styles.pulsePanel} ${styles.heroRanking}`} aria-labelledby="challenge-ranking">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Ranking</p>
          <h2 id="challenge-ranking">Noch keine Platzierungen</h2>
        </div>
      </div>
      <div className={styles.rankingFacts}>
        <article>
          <span>Gestartet</span>
          <strong>{challenge.participants}</strong>
        </article>
        <article>
          <span>Aktive Streaks</span>
          <strong>-</strong>
        </article>
      </div>
      <p className={styles.emptyPanelText}>
        Sobald echte Check-ins vorliegen, erscheinen hier Streaks und Plaetze.
        Bis dahin zeigen wir keine erfundenen Namen.
      </p>
    </article>
  );
}

function RealChallengeMatePanel() {
  return (
    <aside className={`${styles.pulsePanel} ${styles.matePanel}`}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Challenge Mate</p>
          <h2>Noch kein echtes Matching</h2>
        </div>
      </div>
      <p>
        Das Matching wird erst aktiviert, wenn Profil- und Standortdaten freiwillig
        hinterlegt werden. Dann kann ChallengeHub echte passende Mitstreiter anzeigen.
      </p>
      <Link className={styles.mateLink} href="/challenge-mate">
        Challenge Mate vorbereiten
      </Link>
    </aside>
  );
}
