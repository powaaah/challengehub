"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  readActiveChallenges,
  todayKey,
  type ActiveChallenge,
  writeActiveChallenges
} from "./challenge-storage";
import styles from "./challenge-start.module.css";

type ChallengeStartProps = {
  challenge: {
    slug: string;
    title: string;
    goal: string;
    duration: string;
    targetDays?: number;
  };
};

export function ChallengeStart({ challenge }: ChallengeStartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(todayKey());
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const activeSlugsSnapshot = useSyncExternalStore(subscribeToActiveChallenges, getActiveSlugsSnapshot, () => "");
  const alreadyActive = activeSlugsSnapshot.split("|").includes(challenge.slug);

  function startChallenge() {
    const activeChallenges = readActiveChallenges();
    const nextChallenge: ActiveChallenge = {
      slug: challenge.slug,
      title: challenge.title,
      goal: challenge.goal,
      duration: challenge.duration,
      targetDays: challenge.targetDays,
      startedAt: startDate,
      checkIns: [],
      safetyAccepted
    };

    const nextChallenges = [
      nextChallenge,
      ...activeChallenges.filter((active) => active.slug !== challenge.slug)
    ];

    writeActiveChallenges(nextChallenges);
    setStarted(true);
  }

  if (alreadyActive && !started) {
    return (
      <Link className={styles.dashboardLink} href="/meine-challenges">
        In meinen Challenges ansehen
      </Link>
    );
  }

  return (
    <>
      <button className={styles.startButton} type="button" onClick={() => setIsOpen(true)}>
        Challenge starten
      </button>

      {isOpen && (
        <div className={styles.backdrop} role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-challenge-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className={styles.closeButton} type="button" onClick={() => setIsOpen(false)}>
              x
            </button>
            {started ? (
              <>
                <p className={styles.kicker}>Gestartet</p>
                <h2 id="start-challenge-title">{challenge.title}</h2>
                <p>
                  Die Challenge liegt jetzt lokal in deinem Browser unter
                  &quot;Meine Challenges&quot;. Dort kannst du heute einchecken.
                </p>
                <Link className={styles.dashboardLink} href="/meine-challenges">
                  Zu meinen Challenges
                </Link>
              </>
            ) : (
              <>
                <p className={styles.kicker}>Challenge starten</p>
                <h2 id="start-challenge-title">{challenge.title}</h2>
                <p>{challenge.goal}</p>
                <label className={styles.field}>
                  Startdatum
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={safetyAccepted}
                    onChange={(event) => setSafetyAccepted(event.target.checked)}
                  />
                  Ich habe die Sicherheitshinweise gelesen und starte eigenverantwortlich.
                </label>
                <button
                  className={styles.startButton}
                  type="button"
                  disabled={!safetyAccepted}
                  onClick={startChallenge}
                >
                  Jetzt starten
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function subscribeToActiveChallenges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("challengehub:active-challenges", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("challengehub:active-challenges", onStoreChange);
  };
}

function getActiveSlugsSnapshot() {
  return readActiveChallenges()
    .map((active) => active.slug)
    .sort()
    .join("|");
}
