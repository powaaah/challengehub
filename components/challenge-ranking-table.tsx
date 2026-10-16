"use client";

import { useId, useState } from "react";
import {
  selectChallengeRankingWindow,
  type ChallengeRankingEntry,
} from "@/lib/challenge-progress";
import { formatRankingTime } from "@/domain/challenges/completion-result";
import styles from "./challenge-ranking-table.module.css";

type Props = {
  entries: ChallengeRankingEntry[];
  currentParticipationId?: string;
  collapsedLimit?: number;
};

export function ChallengeRankingTable({
  entries,
  currentParticipationId,
  collapsedLimit = 20,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const tableId = useId();
  const canExpand = collapsedLimit < 20 && entries.length > collapsedLimit;
  const { topEntries, nearbyEntries } = selectChallengeRankingWindow(
    entries,
    currentParticipationId,
    expanded ? 20 : collapsedLimit,
  );
  const podium = topEntries
    .slice(0, 3)
    .filter((entry) =>
      entry.definition.type === "one_time_result"
        ? entry.completed
        : entry.checkIns.length > 0,
    );
  const podiumIds = new Set(podium.map((entry) => entry.id));
  const rows = topEntries.filter((entry) => !podiumIds.has(entry.id));
  const isOnce = entries[0]?.definition.type === "one_time_result";
  const timeTitle =
    entries[0]?.definition.direction === "at_least" &&
    ["seconds", "minutes"].includes(entries[0]?.definition.unit)
      ? "Dauer"
      : "Bestzeit";
  return (
    <div className={styles.rankingBox}>
      {entries.length === 0 ? (
        <div className={styles.emptyHint}>
          <strong>Noch keine Rangliste</strong>
          <span>Der erste echte Check-in eröffnet dieses Ranking.</span>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <ol className={styles.podium} aria-label="Podium">
              {podium.map((entry) => (
                <li
                  key={entry.id}
                  className={`${styles.podiumCard} ${entry.rank === 1 ? styles.gold : entry.rank === 2 ? styles.silver : styles.bronze}`}
                  aria-current={
                    entry.id === currentParticipationId ? "true" : undefined
                  }
                >
                  <span className={styles.place}>
                    <span className={styles.srOnly}>Platz </span>#{entry.rank}
                  </span>
                  <svg
                    className={styles.avatar}
                    viewBox="0 0 80 80"
                    aria-hidden="true"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="40"
                      fill="currentColor"
                      opacity=".12"
                    />
                    <circle
                      cx="40"
                      cy="29"
                      r="13"
                      fill="currentColor"
                      opacity=".7"
                    />
                    <path
                      d="M14 69c0-15 11-24 26-24s26 9 26 24"
                      fill="currentColor"
                      opacity=".7"
                    />
                  </svg>
                  <strong className={styles.podiumName}>
                    {entry.name}
                    {entry.id === currentParticipationId && (
                      <span className={styles.you}>Du</span>
                    )}
                  </strong>
                  <span className={styles.podiumValue}>{entry.scoreLabel}</span>
                  {isOnce && entry.rankingTimeSeconds !== null && (
                    <span className={styles.achieved}>✓ Geschafft</span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {(rows.length > 0 || nearbyEntries.length > 0) && (
            <table id={tableId} className={styles.table}>
              <caption className={styles.srOnly}>
                Ranking – weitere Platzierungen
              </caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">{isOnce ? "Geschafft" : "Ergebnis"}</th>
                  <th scope="col">{isOnce ? timeTitle : "Quote"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => (
                  <RankingRow
                    key={entry.id}
                    entry={entry}
                    isCurrent={entry.id === currentParticipationId}
                  />
                ))}
                {nearbyEntries.length > 0 && (
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
                )}
              </tbody>
            </table>
          )}
          {canExpand && (
            <button
              className={styles.toggleButton}
              type="button"
              aria-controls={tableId}
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Weniger anzeigen" : "Weitere Platzierungen anzeigen"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function RankingRow({
  entry,
  isCurrent,
}: {
  entry: ChallengeRankingEntry;
  isCurrent: boolean;
}) {
  const isOnce = entry.definition.type === "one_time_result";
  return (
    <tr aria-current={isCurrent ? "true" : undefined}>
      <td>{entry.rank}</td>
      <th scope="row">
        {entry.name}
        {isCurrent && <span className={styles.you}>Du</span>}
      </th>
      <td>
        {isOnce ? (
          entry.completed ? (
            <span className={styles.check} role="img" aria-label="Geschafft">
              ✓
            </span>
          ) : (
            <span className={styles.pending}>Noch offen</span>
          )
        ) : (
          entry.scoreLabel
        )}
      </td>
      <td>
        {isOnce ? (
          entry.rankingTimeSeconds !== null ? (
            formatRankingTime(entry.rankingTimeSeconds)
          ) : (
            <span className={styles.pending}>
              —<span className={styles.srOnly}> Keine Zeit angegeben</span>
            </span>
          )
        ) : (
          `${entry.completionRate}%`
        )}
      </td>
    </tr>
  );
}
