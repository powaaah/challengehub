import type { ChallengeHistoryDay } from "@/lib/challenge-progress";
import styles from "./challenge-history.module.css";

type ChallengeHistoryProps = {
  days: ChallengeHistoryDay[];
};

const statusLabels: Record<ChallengeHistoryDay["status"], string> = {
  fulfilled: "erledigt",
  missed: "verpasst",
  open: "heute noch offen"
};

export function ChallengeHistory({ days }: ChallengeHistoryProps) {
  return (
    <section className={styles.section} aria-labelledby="challenge-history-title">
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Dein Verlauf</p>
          <h2 id="challenge-history-title">Die letzten 12 Wochen</h2>
        </div>
        <p>Jeder Tag seit deinem Start, basierend auf deinen gespeicherten Check-ins.</p>
      </div>

      <ol className={styles.grid} aria-label="Challenge-Verlauf nach Tagen">
        {days.map((day) => (
          <li
            className={styles[day.status]}
            key={day.date}
            title={`${formatDate(day.date)}: ${statusLabels[day.status]}`}
          >
            <span className={styles.srOnly}>
              {formatDate(day.date)}: {statusLabels[day.status]}
            </span>
          </li>
        ))}
      </ol>

      <ul className={styles.legend} aria-label="Legende">
        <li><span className={styles.fulfilled} aria-hidden="true" /> Erledigt</li>
        <li><span className={styles.missed} aria-hidden="true" /> Verpasst</li>
        <li><span className={styles.open} aria-hidden="true" /> Heute offen</li>
      </ul>
    </section>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00.000Z`));
}
