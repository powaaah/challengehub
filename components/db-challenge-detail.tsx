import Image from "next/image";
import Link from "next/link";
import { ChallengeStart } from "./challenge-start";
import { levelLabels } from "@/data/challenges";
import type { DbPublicChallenge } from "@/lib/db";
import styles from "./user-challenge-detail.module.css";

export function DbChallengeDetail({ challenge }: { challenge: DbPublicChallenge }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Challenge Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/challenges/neu">Erstellen</Link>
          <Link href="/meine-challenges">Meine Challenges</Link>
          <Link href="/wissen">Wissen</Link>
        </nav>
      </header>

      <section className={`${styles.hero} ${styles[challenge.level]}`}>
        <Link className={styles.backLink} href="/#challenges">
          Zurueck zu den Challenges
        </Link>
        <p className={styles.level}>Oeffentliche Challenge | {levelLabels[challenge.level]}</p>
        <h1>{challenge.title}</h1>
        <p className={styles.description}>{challenge.description}</p>
        <div className={styles.metrics}>
          <span>{challenge.category}</span>
          <span>{challenge.durationDays} Tage</span>
          <span>Von {challenge.creatorName}</span>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.primaryPanel}>
          <p className={styles.eyebrow}>Ziel</p>
          <h2>{challenge.goal}</h2>
          <p>
            Diese Challenge ist serverseitig gespeichert und oeffentlich im Katalog sichtbar.
            Starte sie, checke regelmaessig ein und beobachte deinen Fortschritt.
          </p>
        </div>

        <aside className={styles.rulesPanel}>
          <p className={styles.eyebrow}>Regeln</p>
          <ol>
            {challenge.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
          <div className={styles.safetyNotice}>
            <strong>Sicherheit zuerst.</strong>
            <p>Pruefe bei koerperlichen oder gesundheitlichen Challenges deine Voraussetzungen und brich bei Warnsignalen ab.</p>
            <Link href="/sicherheit">Sicherheitshinweise lesen</Link>
          </div>
          <ChallengeStart
            challenge={{
              slug: challenge.slug,
              title: challenge.title,
              goal: challenge.goal,
              duration: `${challenge.durationDays} Tage`,
              targetDays: challenge.durationDays
            }}
          />
        </aside>
      </section>

      <section className={styles.tips}>
        <p className={styles.eyebrow}>Tipps</p>
        <h2>So wird die Challenge machbar</h2>
        {challenge.tips.length > 0 ? (
          <ul>
            {challenge.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p>Starte klein, plane deinen Check-in fest ein und halte die Tagesregel eindeutig.</p>
        )}
      </section>
    </main>
  );
}
