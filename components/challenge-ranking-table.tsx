import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  challenge: {
    participants: number;
  };
};

export function ChallengeRankingTable({ challenge }: ChallengeRankingTableProps) {
  const rows = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <div className={styles.rankingBox}>
      {challenge.participants === 0 && <p className={styles.emptyHint}>Sei der Erste in dieser Challenge.</p>}
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
          {rows.map((rank) => (
            <tr key={rank}>
              <td>{rank}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
