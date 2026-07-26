import type { ChallengeRankingEntry } from "@/lib/challenge-progress";
import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  entries: ChallengeRankingEntry[];
  currentParticipationId?: string;
};

export function ChallengeRankingTable({ entries, currentParticipationId }: ChallengeRankingTableProps) {
  const topEntries = entries.slice(0, 10);

  return (
    <div className={styles.rankingBox}>
      {topEntries.length === 0 && (
        <div className={styles.emptyHint}>
          <strong>Sei der Erste.</strong>
          <span>Noch hat niemand einen echten Streak gespeichert.</span>
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Rang</th>
            <th>Teilnehmer</th>
            <th>Streak</th>
            <th>Quote</th>
          </tr>
        </thead>
        <tbody>
          {topEntries.length > 0 ? topEntries.map((entry) => (
            <tr key={entry.id} aria-current={entry.id === currentParticipationId ? "true" : undefined}>
              <td>{entry.rank}</td>
              <td>{entry.name}{entry.id === currentParticipationId ? " (du)" : ""}</td>
              <td>{entry.currentStreak} Tage</td>
              <td>{entry.completionRate}%</td>
            </tr>
          )) : (
            <tr>
              <td>1</td>
              <td>frei</td>
              <td>-</td>
              <td>-</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
