import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Impressum | ChallengeHub",
  description: "Anbieterkennzeichnung fuer ChallengeHub.",
  alternates: {
    canonical: "/impressum"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function ImpressumPage() {
  return (
    <main className={styles.page}>
      <LegalHeader />
      <section className={styles.content}>
        <p className={styles.kicker}>Rechtliches</p>
        <h1>Impressum</h1>
        <p className={styles.intro}>
          Diese Seite ist als Struktur fuer die Anbieterkennzeichnung angelegt.
          Die konkreten Pflichtangaben muessen vor einem Livegang final von Stefan
          eingetragen und geprueft werden.
        </p>

        <div className={styles.warning}>
          <h2>Vor Livegang ausfuellen</h2>
          <p>
            Nach DDG § 5 muessen relevante Anbieterangaben leicht erkennbar,
            unmittelbar erreichbar und staendig verfuegbar sein. Die folgenden
            Felder sind Platzhalter und nicht als finales Impressum geeignet.
          </p>
        </div>

        <div className={styles.panel}>
          <h2>Anbieter</h2>
          <div className={styles.placeholder}>
            <code>Name/Firma:</code>
            <span>[Bitte final eintragen]</span>
            <code>Anschrift:</code>
            <span>[Bitte final eintragen]</span>
            <code>Vertretungsberechtigte Person, falls zutreffend:</code>
            <span>[Bitte final eintragen]</span>
          </div>

          <h3>Kontakt</h3>
          <div className={styles.placeholder}>
            <code>E-Mail:</code>
            <span>[Bitte final eintragen]</span>
            <code>Telefon, falls erforderlich/gewuenscht:</code>
            <span>[Bitte final eintragen]</span>
          </div>

          <h3>Weitere Angaben, falls zutreffend</h3>
          <ul>
            <li>Umsatzsteuer-ID oder Wirtschafts-ID</li>
            <li>Registereintrag</li>
            <li>Zustaendige Aufsichtsbehoerde</li>
            <li>Berufsrechtliche Angaben</li>
            <li>Angaben zur Verbraucherstreitbeilegung</li>
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
      <nav className={styles.nav} aria-label="Rechtliche Navigation">
        <Link href="/#challenges">Challenges</Link>
        <Link href="/wissen">Wissen</Link>
      </nav>
    </header>
  );
}
