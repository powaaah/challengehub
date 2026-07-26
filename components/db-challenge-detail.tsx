import Link from "next/link";
import { SiteFooter, SiteHeader } from "./site-shell";
import { ChallengeStart } from "./challenge-start";
import { ChallengeInvitationAcceptance } from "./challenge-invitation-acceptance";
import { levelLabels } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import type { PublicChallenge } from "@/domain/challenges/public-challenge";
import { buildChallengeBreadcrumbJsonLd, SITE_URL } from "@/lib/seo";
import styles from "./user-challenge-detail.module.css";

export function DbChallengeDetail({
  challenge,
  participantCount,
  user,
  invitationToken,
  invitationChallengeSlug
}: {
  challenge: PublicChallenge;
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
    <main className={styles.page}>
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
      <section className={`${styles.hero} ${styles[challenge.level]}`}>
        <Link className={styles.backLink} href="/challenges">
          Zurück zu den Challenges
        </Link>
        <p className={styles.level}>Öffentliche Challenge | {levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
        <div className={styles.heroActions}>
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
          <p>Jetzt teilnehmen und deinen Fortschritt unter Meine Challenges tracken.</p>
        </div>
        <div className={styles.metrics}>
          <span>{challenge.category}</span>
          <span>{challenge.durationDays} Tage</span>
          <span>{participantCount} echte Starts</span>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.primaryPanel}>
          <p className={styles.eyebrow}>Ziel</p>
          <h2>{challenge.goal}</h2>
          <p>
            Diese Challenge ist serverseitig gespeichert und öffentlich im Katalog sichtbar.
            Starte sie, checke regelmäßig ein und beobachte deinen Fortschritt.
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
            <p>Prüfe bei körperlichen oder gesundheitlichen Challenges deine Voraussetzungen und brich bei Warnsignalen ab.</p>
            <Link href="/sicherheit">Sicherheitshinweise lesen</Link>
          </div>
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
        </aside>
      </section>

      <section className={styles.tips}>
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
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
