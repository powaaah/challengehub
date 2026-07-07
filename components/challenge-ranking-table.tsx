import styles from "./challenge-ranking-table.module.css";

type ChallengeRankingTableProps = {
  challenge: {
    participants: number;
  };
};

export function ChallengeRankingTable({ challenge }: ChallengeRankingTableProps) {
  return (
    <div className={styles.rankingBox}>
      <div className={styles.summary}>
        <article>
          <span>Gestartet</span>
          <strong>{challenge.participants}</strong>
        </article>
        <article>
          <span>Ranking</span>
          <strong>{challenge.participants > 0 ? "im Aufbau" : "-"}</strong>
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
            <tr>
              <td colSpan={4}>
                <strong>Noch keine serverseitige Rangliste</strong>
                <span>Rankings erscheinen hier erst aus echten Starts und Check-ins.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
