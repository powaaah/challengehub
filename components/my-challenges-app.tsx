import Link from "next/link";
import type { CurrentUser } from "@/lib/auth";
import type { Participation } from "@/domain/participations/participation";
import { SiteFooter, SiteHeader } from "./site-shell";
import styles from "./my-challenges-app.module.css";

export function MyChallengesApp({
  user,
  participations
}: {
  user: CurrentUser;
  participations: Participation[];
}) {
  return (
    <>
      <SiteHeader user={user} />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Dein Dashboard</p>
          <h1>Meine Challenges</h1>
          <p>
            Sieh deine serverseitig gespeicherten Teilnahmen und öffne den Challenge-Raum für
            Check-ins, Fortschritt und Ranking.
          </p>
        </section>

        {participations.length === 0 ? (
          <section className={styles.emptyState}>
            <h2>Noch keine aktive Challenge</h2>
            <p>Starte eine Challenge auf einer Detailseite und mache dort deinen ersten Check-in.</p>
            <div className={styles.emptyActions}>
              <Link href="/challenges">Challenges entdecken</Link>
            </div>
          </section>
        ) : (
          <section className={styles.grid} aria-label="Meine Challenges">
            {participations.map((participation) => (
              <article className={styles.card} key={participation.id}>
                <div>
                  <p className={styles.cardKicker}>Gestartet am {formatIsoDate(participation.startedAt)}</p>
                  <h2>{participation.challengeTitle}</h2>
                  <p>{participation.challengeGoal}</p>
                </div>
                <dl className={styles.stats}>
                  <div>
                    <dt>Status</dt>
                    <dd>{participation.status === "active" ? "Aktiv" : "Beendet"}</dd>
                  </div>
                  <div>
                    <dt>Speicherung</dt>
                    <dd>Server</dd>
                  </div>
                  <div>
                    <dt>Raum</dt>
                    <dd>{participation.status === "active" ? "Aktiv" : "Archiv"}</dd>
                  </div>
                </dl>
                <div className={styles.actions}>
                  <Link href={`/meine-challenges/${participation.id}`}>Challenge-Raum</Link>
                  <Link href={`/challenges/${participation.challengeSlug}`}>Detailseite</Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
