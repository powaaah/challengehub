"use client";

import { useId, useState } from "react";
import {
  selectChallengeRankingWindow,
  type ChallengeRankingEntry
} from "@/lib/challenge-progress";
import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  entries: ChallengeRankingEntry[];
  currentParticipationId?: string;
  collapsedLimit?: number;
};

export function ChallengeRankingTable({
  entries,
  currentParticipationId,
  collapsedLimit = 20
}: ChallengeRankingTableProps) {
  const [expanded, setExpanded] = useState(false);
  const tableId = useId();
  const canExpand = collapsedLimit < 20 && entries.length > collapsedLimit;
  const visibleLimit = expanded ? 20 : collapsedLimit;
  const { topEntries, nearbyEntries } = selectChallengeRankingWindow(
    entries,
    currentParticipationId,
    visibleLimit
  );

  return (
    <div className={styles.rankingBox}>
      {entries.length === 0 ? (
        <div className={styles.emptyHint}>
          <strong>Noch keine Rangliste</strong>
          <span>Der erste echte Check-in eröffnet dieses Ranking.</span>
        </div>
      ) : (
        <>
          <table id={tableId} className={styles.table}>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Teilnehmer</th>
                <th>Streak</th>
                <th>Quote</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
          {canExpand ? (
            <button
              className={styles.toggleButton}
              type="button"
              aria-controls={tableId}
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? "Top 5 anzeigen" : "Alle anzeigen"}
            </button>
          ) : null}
        </>
      )}
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
