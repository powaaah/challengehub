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
      startedAt: todayKey(),
      checkIns: [],
      safetyAccepted: true
    };

    const nextChallenges = [
      nextChallenge,
      ...activeChallenges.filter((active) => active.slug !== challenge.slug)
    ];

    writeActiveChallenges(nextChallenges);
    setStarted(true);
    setIsOpen(true);
  }

  if ((alreadyActive || started) && !isOpen) {
    return (
      <Link className={styles.dashboardLink} href="/meine-challenges">
        In meinen Challenges ansehen
      </Link>
    );
  }

  return (
    <>
      <button className={styles.startButton} type="button" onClick={startChallenge}>
        Jetzt teilnehmen
      </button>

      {isOpen && started && (
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
            <p className={styles.kicker}>Du bist drin</p>
            <h2 id="start-challenge-title">{challenge.title}</h2>
            <p>
              Stark. Ab jetzt zählt nicht mehr „irgendwann“, sondern heute. Dein
              erster Eintrag wartet schon. Mach den Tag voll und setz den ersten
              Haken.
            </p>
            <div className={styles.modalActions}>
              <Link className={styles.dashboardLink} href="/meine-challenges">
                Zum Check-in
              </Link>
              <button className={styles.secondaryButton} type="button" onClick={() => setIsOpen(false)}>
                Erst Seite ansehen
              </button>
            </div>
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
