import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Karriere | ChallengeHub",
  description: "Karriere und Mitwirkungsmoeglichkeiten bei ChallengeHub.",
  alternates: {
    canonical: "/karriere"
  }
};

export default function KarrierePage() {
  return (
    <main className={styles.page}>
      <LegalHeader />
      <section className={styles.content}>
        <p className={styles.kicker}>Karriere</p>
        <h1>Mitbauen an besseren Challenges.</h1>
        <p className={styles.intro}>
          ChallengeHub ist aktuell im Rebuild. Konkrete Stellen sind noch nicht
          ausgeschrieben, aber diese Seite ist als Platz fuer spaetere Rollen,
          Partnerschaften und Mitwirkungsmoeglichkeiten vorbereitet.
        </p>

        <div className={styles.panel}>
          <h2>Woran wir arbeiten</h2>
          <ul>
            <li>Challenges, die Menschen wirklich starten und durchhalten.</li>
            <li>Wissensinhalte zu Gewohnheiten, Training, Schlaf und Lernen.</li>
            <li>Ein spaeterer Teilnahme-Flow mit Check-ins, Streaks und Fortschritt.</li>
          </ul>

          <h2>Moegliche Bereiche</h2>
          <ul>
            <li>Content und Recherche</li>
            <li>Frontend und Produktdesign</li>
            <li>Community und Challenge-Ideen</li>
            <li>Sport, Gesundheit und Gewohnheitspsychologie</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function LegalHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
        <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
      </Link>
      <nav className={styles.nav} aria-label="Karriere Navigation">
        <Link href="/#challenges">Challenges</Link>
        <Link href="/wissen">Wissen</Link>
      </nav>
    </header>
  );
}
