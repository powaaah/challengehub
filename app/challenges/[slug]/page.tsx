import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChallengeStart } from "@/components/challenge-start";
import { UserChallengeDetail } from "@/components/user-challenge-detail";
import { challenges, getChallengeBySlug, levelLabels } from "@/data/challenges";
import styles from "./page.module.css";

const siteUrl = "https://challengehub.de";

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
    return <UserChallengeDetail slug={slug} />;
  }

  const pageUrl = `${siteUrl}/challenges/${challenge.slug}`;
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
          Zurueck zu den Challenges
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
      </section>

      <section className={styles.content}>
        <div className={styles.primaryPanel}>
          <p className={styles.eyebrow}>Ziel</p>
          <h2>{challenge.goal}</h2>
          <p>
            Nimm dir die Challenge bewusst vor, dokumentiere deinen Fortschritt und teile
            Zwischenschritte mit Menschen, die dich motivieren. ChallengeHub soll aus einem
            Ziel eine verbindliche, sichtbare Aufgabe machen.
          </p>
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
              Die Inhalte ersetzen keine medizinische Beratung. Pruefe vor intensiven
              Challenges deine Voraussetzungen und brich bei Schmerzen, Schwindel oder
              Unwohlsein ab.
            </p>
            <Link href="/sicherheit">Sicherheitshinweise lesen</Link>
          </div>
          <ChallengeStart challenge={challenge} />
        </aside>
      </section>

      {(challenge.benefits || challenge.stack || challenge.plan) && (
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

      <section className={styles.seoContent} aria-labelledby="challenge-tipps">
        <div className={styles.textPanel}>
          <p className={styles.eyebrow}>Tipps</p>
          <h2 id="challenge-tipps">So wird die Challenge machbar</h2>
          <ul>
            {challenge.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className={styles.textPanel} aria-labelledby="challenge-faq">
          <p className={styles.eyebrow}>FAQ</p>
          <h2 id="challenge-faq">Haeufige Fragen zur Challenge</h2>
          <div className={styles.faqList}>
            {challenge.faq.map((item) => (
              <section key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
