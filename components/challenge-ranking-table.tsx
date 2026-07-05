"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  calculateStreak,
  readActiveChallenges,
  todayKey,
  type ActiveChallenge
} from "./challenge-storage";
import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  challenge: {
    slug: string;
    participants: number;
  };
};

export function ChallengeRankingTable({ challenge }: ChallengeRankingTableProps) {
  const activeSnapshot = useSyncExternalStore(subscribeToActiveChallenges, getActiveChallengesSnapshot, () => "[]");
  const activeChallenge = useMemo(() => {
    const activeChallenges = JSON.parse(activeSnapshot) as ActiveChallenge[];
    return activeChallenges.find((item) => item.slug === challenge.slug) ?? null;
  }, [activeSnapshot, challenge.slug]);

  const today = todayKey();
  const streak = activeChallenge ? calculateStreak(activeChallenge.checkIns, today) : 0;
  const completedDays = activeChallenge ? new Set(activeChallenge.checkIns).size : 0;
  const elapsedDays = activeChallenge ? daysSinceStart(activeChallenge.startedAt, today) : 0;
  const completionRate = elapsedDays > 0 ? Math.min(100, Math.round((completedDays / elapsedDays) * 100)) : 0;

  return (
    <div className={styles.rankingBox}>
      <div className={styles.summary}>
        <article>
          <span>Gestartet</span>
          <strong>{challenge.participants}</strong>
        </article>
        <article>
          <span>Deine Quote</span>
          <strong>{activeChallenge ? `${completionRate}%` : "-"}</strong>
        </article>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Teilnehmer</th>
              <th>Streak</th>
              <th>Erledigt</th>
              <th>Quote</th>
            </tr>
          </thead>
          <tbody>
            {activeChallenge ? (
              <tr>
                <td>
                  <strong>Du</strong>
                  <span>seit {formatDate(activeChallenge.startedAt)}</span>
                </td>
                <td>{streak} T.</td>
                <td>
                  {completedDays}/{elapsedDays}
                </td>
                <td>{completionRate}%</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={4}>
                  <strong>Noch kein eigener Stand</strong>
                  <span>Starte die Challenge und checke ein, dann erscheint hier deine echte Quote.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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

function getActiveChallengesSnapshot() {
  return JSON.stringify(readActiveChallenges());
}

function daysSinceStart(startedAt: string, today: string) {
  const start = new Date(`${startedAt}T12:00:00`);
  const end = new Date(`${today}T12:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(`${value}T12:00:00`));
}
