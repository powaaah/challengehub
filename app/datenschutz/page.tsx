import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Datenschutz | ChallengeHub",
  description: "Vorlaeufige Datenschutzinformationen fuer den ChallengeHub Next.js-Rebuild.",
  alternates: {
    canonical: "/datenschutz"
  },
  robots: {
    index: false,
    follow: true
  }
};

export const dynamic = "force-dynamic";

export default async function DatenschutzPage() {
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>Rechtliches</p>
        <h1>Datenschutz</h1>
        <p className={styles.intro}>
          Diese Datenschutzhinweise beschreiben den aktuellen statischen
          Next.js-Rebuild. Sobald Login, Registrierung, Tracking, Kontaktformulare
          oder Datenbankfunktionen aktiviert werden, muss diese Seite aktualisiert
          und final geprueft werden.
        </p>

        <div className={styles.warning}>
          <h2>Vorlaeufiger Stand</h2>
          <p>
            Im aktuellen lokalen Rebuild werden keine produktiven Nutzerkonten,
            Passwoerter, Zahlungsdaten oder Challenge-Fortschritte gespeichert.
            Server-Hosting, Logfiles und spaetere Features koennen aber
            personenbezogene Daten betreffen.
          </p>
        </div>

        <div className={styles.panel}>
          <h2>Verantwortlicher</h2>
          <div className={styles.placeholder}>
            <code>Name/Firma:</code>
            <span>[Bitte final eintragen]</span>
            <code>Kontakt:</code>
            <span>[Bitte final eintragen]</span>
          </div>

          <h2>Aktuelle Datenverarbeitung im Rebuild</h2>
          <ul>
            <li>Statische Seiteninhalte zu Challenges und Wissen.</li>
            <li>Clientseitige Suche und Filterung ohne Serveruebertragung.</li>
            <li>Login- und Registrierungsformulare sind noch nicht produktiv angebunden.</li>
            <li>Kein bewusst eingebundenes Tracking im Next.js-Rebuild.</li>
          </ul>

          <h2>Zu klaeren vor Livegang</h2>
          <ul>
            <li>Hosting-Provider und Server-Logfiles</li>
            <li>Rechtsgrundlagen nach DSGVO Art. 6</li>
            <li>Informationspflichten nach DSGVO Art. 13</li>
            <li>Speicherdauer und Loeschkonzept</li>
            <li>Betroffenenrechte und Kontaktweg</li>
            <li>Cookies, Analytics, Newsletter oder externe Dienste</li>
            <li>Auth, Datenbank, Check-ins und Bewertungen</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
