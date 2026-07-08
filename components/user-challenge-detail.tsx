"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { SiteFooter, SiteHeader } from "./site-shell";
import { ChallengeStart } from "./challenge-start";
import { readUserChallenges, subscribeToUserChallenges, type UserChallenge } from "./user-challenges-storage";
import { levelLabels } from "@/data/challenges";
import type { CurrentUser } from "@/lib/auth";
import styles from "./user-challenge-detail.module.css";

export function UserChallengeDetail({ slug, user }: { slug: string; user: CurrentUser | null }) {
  const serializedChallenges = useSyncExternalStore(
    subscribeToUserChallenges,
    getUserChallengesSnapshot,
    () => "[]"
  );
  const challenge = useMemo<UserChallenge | null>(() => {
    const userChallenges = JSON.parse(serializedChallenges) as UserChallenge[];
    return userChallenges.find((item) => item.slug === slug) ?? null;
  }, [serializedChallenges, slug]);

  if (!challenge) {
    return (
      <>
      <SiteHeader user={user} />
      <main className={styles.page}>
        <section className={styles.notFound}>
          <p className={styles.eyebrow}>Nicht gefunden</p>
          <h1>Diese Challenge gibt es hier noch nicht.</h1>
          <p>Lokale User-Challenges sind an diesen Browser gebunden. Erstelle eine neue Challenge oder gehe zur Uebersicht.</p>
          <div className={styles.actions}>
            <Link href="/challenges/neu">Challenge erstellen</Link>
            <Link href="/challenges">Challenges entdecken</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      </>
    );
  }

  return (
    <>
    <SiteHeader user={user} />
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles[challenge.level]}`}>
        <Link className={styles.backLink} href="/challenges">
          Zurueck zu den Challenges
        </Link>
        <p className={styles.level}>Oeffentliche User Challenge | {levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
        <div className={styles.heroActions}>
          <ChallengeStart
            isAuthenticated={Boolean(user)}
            isAvailable={false}
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
          <span>0 Teilnehmer</span>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.primaryPanel}>
          <p className={styles.eyebrow}>Ziel</p>
          <h2>{challenge.goal}</h2>
          <p>
            Diese Challenge wurde oeffentlich erstellt und kann sofort gestartet werden.
            Halte die Regeln einfach, checke jeden Tag ein und beobachte deinen Fortschritt.
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
            <p>Pruefe bei koerperlichen oder gesundheitlichen Challenges deine Voraussetzungen und brich bei Warnsignalen ab.</p>
            <Link href="/sicherheit">Sicherheitshinweise lesen</Link>
          </div>
          <ChallengeStart
            isAuthenticated={Boolean(user)}
            isAvailable={false}
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
          <p>Starte klein, plane deinen Check-in fest ein und mache die Regel so eindeutig, dass du sie nicht jeden Tag neu verhandeln musst.</p>
        )}
      </section>
    </main>
    <SiteFooter />
    </>
  );
}

function getUserChallengesSnapshot() {
  return JSON.stringify(readUserChallenges());
}
