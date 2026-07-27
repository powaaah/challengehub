import {
  selectChallengeRankingWindow,
  type ChallengeRankingEntry
} from "@/lib/challenge-progress";
import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  entries: ChallengeRankingEntry[];
  currentParticipationId?: string;
};

export function ChallengeRankingTable({ entries, currentParticipationId }: ChallengeRankingTableProps) {
  const { topEntries, nearbyEntries } = selectChallengeRankingWindow(entries, currentParticipationId);

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
          {topEntries.length > 0 ? (
            <>
              {topEntries.map((entry) => (
                <RankingRow
                  key={entry.id}
                  entry={entry}
                  isCurrent={entry.id === currentParticipationId}
                />
              ))}
              {nearbyEntries.length > 0 ? (
                <>
                  <tr className={styles.positionDivider}>
                    <td colSpan={4}>Deine Position</td>
                  </tr>
                  {nearbyEntries.map((entry) => (
                    <RankingRow
                      key={entry.id}
                      entry={entry}
                      isCurrent={entry.id === currentParticipationId}
                    />
                  ))}
                </>
              ) : null}
            </>
          ) : (
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

function RankingRow({ entry, isCurrent }: { entry: ChallengeRankingEntry; isCurrent: boolean }) {
  return (
    <tr aria-current={isCurrent ? "true" : undefined}>
      <td>{entry.rank}</td>
      <td>{entry.name}{isCurrent ? " (du)" : ""}</td>
      <td>{entry.currentStreak} Tage</td>
      <td>{entry.completionRate}%</td>
    </tr>
  );
}
