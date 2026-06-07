import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Sicherheit und Gesundheit | ChallengeHub",
  description: "Sicherheitshinweise fuer Fitness-, Ernaehrungs-, Schlaf- und Gewohnheits-Challenges auf ChallengeHub.",
  alternates: {
    canonical: "/sicherheit"
  }
};

export default function SicherheitPage() {
  return (
    <main className={styles.page}>
      <LegalHeader />
      <section className={styles.content}>
        <p className={styles.kicker}>Sicherheit</p>
        <h1>Gesundheit geht vor Challenge.</h1>
        <p className={styles.intro}>
          ChallengeHub motiviert zu Zielen, Gewohnheiten und Training. Die Inhalte
          sind aber keine medizinische, psychologische, ernaehrungswissenschaftliche
          oder sporttherapeutische Beratung.
        </p>

        <div className={styles.warning}>
          <h2>Wichtiger Hinweis</h2>
          <p>
            Starte intensive Challenges nur, wenn sie zu deiner Gesundheit, deinem
            Trainingsstand und deiner Lebenssituation passen. Bei Vorerkrankungen,
            Schmerzen, Schwangerschaft, Essstoerungen, Herz-Kreislauf-Themen oder
            Unsicherheit solltest du vorher fachlichen Rat einholen.
          </p>
        </div>

        <div className={styles.panel}>
          <h2>Grundregeln fuer sichere Challenges</h2>
          <ul>
            <li>Brich eine Challenge ab, wenn Schmerzen, Schwindel, Atemnot oder starkes Unwohlsein auftreten.</li>
            <li>Steigere Belastung schrittweise statt sprunghaft.</li>
            <li>Schlaf, Regeneration und Essen sind Teil der Performance.</li>
            <li>Extreme Challenges sind nicht automatisch bessere Challenges.</li>
            <li>Vergleiche dich nicht blind mit anderen Teilnehmern.</li>
            <li>Bei Ernaehrungszielen steht nachhaltiges Verhalten vor extremen Einzeltagen.</li>
          </ul>

          <h2>Besonders vorsichtig bei</h2>
          <ul>
            <li>Maximalkraft- und sehr schweren Kraftzielen</li>
            <li>extremen Kalorien- oder Verzichts-Challenges</li>
            <li>langen Ausdauerbelastungen ohne Trainingsgrundlage</li>
            <li>Challenges, die Schlaf dauerhaft reduzieren</li>
            <li>Challenges, die Druck, Schuldgefuehle oder Kontrollverlust ausloesen</li>
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
      <nav className={styles.nav} aria-label="Sicherheits Navigation">
        <Link href="/#challenges">Challenges</Link>
        <Link href="/wissen">Wissen</Link>
      </nav>
    </header>
  );
}
