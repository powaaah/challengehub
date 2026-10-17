import { getBodyRanking } from "@/lib/body-transformation";
import styles from "./body-transformation.module.css";
export function BodyRanking() {
  const entries = getBodyRanking();
  return (
    <div className={styles.ranking}>
      <p>
        Abnahme des geschätzten Navy-KFA in Prozentpunkten. Selbstauskunft. Nur
        im Profil freigegebene Ergebnisse erscheinen hier; Messwerte und Bilder
        bleiben privat.
      </p>
      {[true, false].map((final) => {
        const rows = entries.filter((e) => e.final === final);
        return (
          <section key={String(final)}>
            <h3>{final ? "100-Tage-Ergebnisse" : "Laufende Zwischenstände"}</h3>
            {!rows.length ? (
              <p>
                Noch keine vergleichbaren Ergebnisse. Eine vollständige
                Navy-Messung an Tag 1 und eine spätere Messung sind
                erforderlich.
              </p>
            ) : (
              <ol className={styles.leaderboard}>
                {rows.slice(0, 20).map((row, index) => (
                  <li key={row.id}>
                    <span>
                      #{rows.findIndex((e) => e.points === row.points) + 1}
                    </span>
                    <strong>{row.name}</strong>
                    <b>
                      {row.points.toLocaleString("de-DE", {
                        minimumFractionDigits: 1,
                      })}{" "}
                      PP
                    </b>
                    <span className={styles.srOnly}>Position {index + 1}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
