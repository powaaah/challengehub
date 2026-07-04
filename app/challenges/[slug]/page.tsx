import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChallengeStart } from "@/components/challenge-start";
import { DbChallengeDetail } from "@/components/db-challenge-detail";
import {
  StepsChallengeTools,
  StepsKnowledgeSection
} from "@/components/steps-challenge-tools";
import { UserChallengeDetail } from "@/components/user-challenge-detail";
import { challenges, getChallengeBySlug, levelLabels, type Challenge } from "@/data/challenges";
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

  if (!challenge) {
    const dbChallenge = getPublishedChallengeBySlug(slug);
    if (dbChallenge) {
      return <DbChallengeDetail challenge={dbChallenge} />;
    }

    return <UserChallengeDetail slug={slug} />;
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
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: challenge.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Challenge Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/challenges/neu">Erstellen</Link>
          <Link href="/meine-challenges">Meine Challenges</Link>
          <Link href="/wissen">Wissen</Link>
          <Link href="/#ranking">Ranking</Link>
        </nav>
      </header>

      <section className={`${styles.hero} ${styles[challenge.level]}`}>
        <Link className={styles.backLink} href="/#challenges">
          Zurück zu den Challenges
        </Link>
        <p className={styles.level}>{levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
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
        {isStepsChallenge && (
          <div className={styles.heroActions}>
            <ChallengeStart challenge={challenge} />
            <p>Heute starten, Schritte vollmachen, Streak halten.</p>
          </div>
        )}
      </section>

      <section className={styles.pulseGrid} aria-label="Challenge Aktivität">
        <ChallengeRankingPanel challenge={challenge} isStepsChallenge={isStepsChallenge} />
        <CommunityQuestionsPanel challenge={challenge} />
        <ChallengeMatePanel />
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
  );
}

function ChallengeRankingPanel({
  challenge,
  isStepsChallenge
}: {
  challenge: Challenge;
  isStepsChallenge: boolean;
}) {
  const leaders = isStepsChallenge
    ? [
        { rank: 1, name: "Mara", streak: 184, completedDays: 219 },
        { rank: 2, name: "Jonas", streak: 172, completedDays: 201 },
        { rank: 3, name: "Nina", streak: 149, completedDays: 190 },
        { rank: 4, name: "Tarek", streak: 131, completedDays: 177 },
        { rank: 5, name: "Lea", streak: 118, completedDays: 141 },
        { rank: 6, name: "Chris", streak: 101, completedDays: 132 },
        { rank: 7, name: "Sven", streak: 96, completedDays: 120 },
        { rank: 8, name: "Aylin", streak: 88, completedDays: 116 },
        { rank: 9, name: "Mika", streak: 81, completedDays: 109 },
        { rank: 10, name: "Karo", streak: 74, completedDays: 98 },
        { rank: 11, name: "Ben", streak: 69, completedDays: 90 },
        { rank: 12, name: "Jule", streak: 61, completedDays: 85 },
        { rank: 13, name: "Olli", streak: 55, completedDays: 76 },
        { rank: 14, name: "Sam", streak: 48, completedDays: 68 },
        { rank: 15, name: "Rina", streak: 43, completedDays: 57 },
        { rank: 16, name: "Noah", streak: 39, completedDays: 51 },
        { rank: 17, name: "Elli", streak: 34, completedDays: 49 },
        { rank: 18, name: "Malik", streak: 30, completedDays: 44 },
        { rank: 19, name: "Lena", streak: 26, completedDays: 39 },
        { rank: 20, name: "Tom", streak: 24, completedDays: 36 }
      ]
    : [
        { rank: 1, name: "Mara", streak: Math.max(21, Math.round(challenge.participants * 0.42)), completedDays: Math.max(30, Math.round(challenge.participants * 0.55)) },
        { rank: 2, name: "Jonas", streak: Math.max(18, Math.round(challenge.participants * 0.36)), completedDays: Math.max(28, Math.round(challenge.participants * 0.49)) },
        { rank: 3, name: "Nina", streak: Math.max(16, Math.round(challenge.participants * 0.31)), completedDays: Math.max(24, Math.round(challenge.participants * 0.43)) },
        { rank: 4, name: "Tarek", streak: Math.max(14, Math.round(challenge.participants * 0.26)), completedDays: Math.max(21, Math.round(challenge.participants * 0.36)) },
        { rank: 5, name: "Lea", streak: Math.max(12, Math.round(challenge.participants * 0.22)), completedDays: Math.max(18, Math.round(challenge.participants * 0.31)) }
      ];

  const ownRows = [
    { rank: 42, name: "Paula", streak: 13, completedDays: 19 },
    { rank: 43, name: "Du", streak: 12, completedDays: 18, isOwn: true },
    { rank: 44, name: "Marco", streak: 11, completedDays: 17 }
  ];

  return (
    <article className={`${styles.pulsePanel} ${styles.rankingPanel}`} aria-labelledby="challenge-ranking">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Ranking</p>
          <h2 id="challenge-ranking">Streak Leaderboard</h2>
        </div>
        <span>{leaders.length > 5 ? "Top 20" : "Top 5"}</span>
      </div>

      <div className={styles.rankingScroll}>
        <div className={styles.rankingTable} role="table" aria-label={`${challenge.title} Ranking`}>
          <div role="row" className={styles.rankingHeader}>
            <span>Platz</span>
            <span>Name</span>
            <span>Streak</span>
            <span>Tage</span>
          </div>
          {leaders.map((row) => (
            <div role="row" className={styles.rankingRow} key={row.rank}>
              <span>#{row.rank}</span>
              <strong>{row.name}</strong>
              <span>{row.streak} Tage</span>
              <span>{row.completedDays}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ownRankBlock}>
        <span aria-hidden="true">...</span>
        {ownRows.map((row) => (
          <div className={`${styles.rankingRow} ${row.isOwn ? styles.ownRank : ""}`} key={row.rank}>
            <span>#{row.rank}</span>
            <strong>{row.name}</strong>
            <span>{row.streak} Tage</span>
            <span>{row.completedDays}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function CommunityQuestionsPanel({ challenge }: { challenge: Challenge }) {
  const questions = challenge.faq.slice(0, 2).map((item, index) => ({
    question: item.question,
    answers: [
      { author: index === 0 ? "Mara" : "Jonas", likes: index === 0 ? 42 : 31, text: item.answer },
      {
        author: index === 0 ? "Lea" : "Nina",
        likes: index === 0 ? 18 : 16,
        text: index === 0
          ? "Kurz halten, klar tracken, nicht diskutieren. Genau dann bleibt die Challenge simpel."
          : "Die Antwort mit den meisten Likes steht oben. Gute Hinweise steigen dadurch automatisch nach vorne."
      }
    ]
  }));

  return (
    <article className={`${styles.pulsePanel} ${styles.qaPanel}`} aria-labelledby="challenge-questions">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Q&A</p>
          <h2 id="challenge-questions">Community-Fragen</h2>
        </div>
        <button type="button">Frage stellen</button>
      </div>

      <div className={styles.questionList}>
        {questions.map((item) => (
          <section className={styles.questionItem} key={item.question}>
            <h3>{item.question}</h3>
            {item.answers
              .sort((a, b) => b.likes - a.likes)
              .slice(0, 1)
              .map((answer) => (
                <div className={styles.answerItem} key={answer.author}>
                  <span>{answer.likes} Likes</span>
                  <p>{answer.text}</p>
                  <small>{answer.author}</small>
                </div>
              ))}
          </section>
        ))}
      </div>
    </article>
  );
}

function ChallengeMatePanel() {
  return (
    <aside className={`${styles.pulsePanel} ${styles.matePanel}`}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Challenge Mate</p>
          <h2>Zu zweit hält besser</h2>
        </div>
      </div>
      <p>
        Such dir jemanden mit ähnlichem Ziel. Ihr seht euren Streak, pusht euch kurz
        an und macht aus „ich sollte mal“ ein klares „wir ziehen das durch“.
      </p>
      <Link className={styles.mateLink} href="/challenge-mate">
        Challenge Mate finden
      </Link>
    </aside>
  );
}
