import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Impressum | ChallengeHub",
  description: "Anbieterkennzeichnung für ChallengeHub.",
  alternates: {
    canonical: "/impressum"
  },
  robots: {
    index: false,
    follow: true
  }
};

export const dynamic = "force-dynamic";

export default async function ImpressumPage() {
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>Rechtliches</p>
        <h1>Impressum</h1>
        <p className={styles.intro}>
          Diese Seite ist als Struktur für die Anbieterkennzeichnung angelegt.
          Die konkreten Pflichtangaben müssen vor einem Livegang final von Stefan
          eingetragen und geprüft werden.
        </p>

        <div className={styles.warning}>
          <h2>Vor Livegang ausfüllen</h2>
          <p>
            Nach DDG § 5 müssen relevante Anbieterangaben leicht erkennbar,
            unmittelbar erreichbar und ständig verfügbar sein. Die folgenden
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
            <code>Telefon, falls erforderlich/gewünscht:</code>
            <span>[Bitte final eintragen]</span>
          </div>

          <h3>Weitere Angaben, falls zutreffend</h3>
          <ul>
            <li>Umsatzsteuer-ID oder Wirtschafts-ID</li>
            <li>Registereintrag</li>
            <li>Zuständige Aufsichtsbehörde</li>
            <li>Berufsrechtliche Angaben</li>
            <li>Angaben zur Verbraucherstreitbeilegung</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
