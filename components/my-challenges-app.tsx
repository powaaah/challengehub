"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  calculateStreak,
  readActiveChallenges,
  todayKey,
  type ActiveChallenge,
  writeActiveChallenges
} from "./challenge-storage";
import styles from "./my-challenges-app.module.css";

export function MyChallengesApp() {
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
  const today = useMemo(() => todayKey(), []);

  useEffect(() => {
    function syncChallenges() {
      setActiveChallenges(readActiveChallenges());
    }

    syncChallenges();
    window.addEventListener("storage", syncChallenges);
    window.addEventListener("challengehub:active-challenges", syncChallenges);

    return () => {
      window.removeEventListener("storage", syncChallenges);
      window.removeEventListener("challengehub:active-challenges", syncChallenges);
    };
  }, []);

  function updateChallenges(nextChallenges: ActiveChallenge[]) {
    setActiveChallenges(nextChallenges);
    writeActiveChallenges(nextChallenges);
  }

  function toggleToday(slug: string) {
    updateChallenges(
      activeChallenges.map((challenge) => {
        if (challenge.slug !== slug) {
          return challenge;
        }

        const hasToday = challenge.checkIns.includes(today);
        return {
          ...challenge,
          checkIns: hasToday
            ? challenge.checkIns.filter((date) => date !== today)
            : [...challenge.checkIns, today].sort()
        };
      })
    );
  }

  function removeChallenge(slug: string) {
    updateChallenges(activeChallenges.filter((challenge) => challenge.slug !== slug));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Meine Challenges Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/wissen">Wissen</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>Dein Dashboard</p>
        <h1>Meine Challenges</h1>
        <p>
          Dieser MVP speichert deine gestarteten Challenges lokal in deinem Browser.
          So koennen wir den Produktflow testen, bevor Login und Datenbank dazukommen.
        </p>
      </section>

      {activeChallenges.length === 0 ? (
        <section className={styles.emptyState}>
          <h2>Noch keine aktive Challenge</h2>
          <p>Starte eine Challenge auf einer Detailseite und mache hier deinen ersten Check-in.</p>
          <Link href="/#challenges">Challenges entdecken</Link>
        </section>
      ) : (
        <section className={styles.grid} aria-label="Aktive Challenges">
          {activeChallenges.map((challenge) => {
            const hasCheckedInToday = challenge.checkIns.includes(today);
            const streak = calculateStreak(challenge.checkIns, today);

            return (
              <article className={styles.card} key={challenge.slug}>
                <div>
                  <p className={styles.cardKicker}>Gestartet am {formatDate(challenge.startedAt)}</p>
                  <h2>{challenge.title}</h2>
                  <p>{challenge.goal}</p>
                </div>
                <dl className={styles.stats}>
                  <div>
                    <dt>Streak</dt>
                    <dd>{streak} Tage</dd>
                  </div>
                  <div>
                    <dt>Check-ins</dt>
                    <dd>{challenge.checkIns.length}</dd>
                  </div>
                  <div>
                    <dt>Dauer</dt>
                    <dd>{challenge.duration}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                  <button
                    className={hasCheckedInToday ? styles.checkedButton : styles.checkButton}
                    type="button"
                    onClick={() => toggleToday(challenge.slug)}
                  >
                    {hasCheckedInToday ? "Heute erledigt" : "Heute einchecken"}
                  </button>
                  <Link href={`/challenges/${challenge.slug}`}>Detailseite</Link>
                  <button className={styles.removeButton} type="button" onClick={() => removeChallenge(challenge.slug)}>
                    Entfernen
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}
