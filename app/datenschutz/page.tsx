import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Datenschutz | ChallengeHub",
  description: "Informationen zur Verarbeitung und Kontrolle deiner Daten bei ChallengeHub.",
  alternates: { canonical: "/datenschutz" },
  robots: { index: false, follow: true }
};

export const dynamic = "force-dynamic";

export default async function DatenschutzPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.content}>
          <p className={styles.kicker}>Rechtliches</p>
          <h1>Datenschutz</h1>
          <p className={styles.intro}>
            Hier erfährst du, welche Daten ChallengeHub im aktuellen Produktstand verarbeitet und welche Einstellungen du selbst steuern kannst.
          </p>

          <div className={styles.warning}>
            <h2>Aktueller technischer Stand</h2>
            <p>
              Diese Beschreibung bildet die implementierten Funktionen ab. Angaben zum Verantwortlichen, zu Rechtsgrundlagen und verbindlichen Aufbewahrungsfristen werden vor dem Produktionsstart ergänzt.
            </p>
          </div>

          <div className={styles.panel}>
            <h2>Verantwortlicher</h2>
            <div className={styles.placeholder}>
              <code>Name/Firma:</code><span>[vor Livegang eintragen]</span>
              <code>Kontakt:</code><span>[vor Livegang eintragen]</span>
            </div>

            <h2>Welche Daten verarbeitet werden</h2>
            <ul>
              <li><strong>Konto und Anmeldung:</strong> Benutzername, E-Mail-Adresse, Passwort-Hash, Sitzungen und Metadaten zu Passwort-Zurücksetzungen.</li>
              <li><strong>Challenges:</strong> selbst erstellte Challenges, Teilnahmen, Check-ins, Messwerte, Notizen und Abschlussstatus.</li>
              <li><strong>Gemeinsame Nutzung:</strong> Einladungen sowie freiwillige ChallengeMate-Profile, Anfragen, Matches, Blockierungen und Meldungen.</li>
              <li><strong>Erinnerungen:</strong> deine Einstellungen, In-App-Mitteilungen und – nur nach Opt-in – der Zustellstatus von E-Mails.</li>
              <li><strong>Betrieb:</strong> pseudonymisierte Kennungen für Missbrauchslimits sowie technisch notwendige Server- und Fehlerprotokolle.</li>
            </ul>

            <h2>Wofür die Daten verwendet werden</h2>
            <p>
              Die Daten werden verwendet, um dein Konto zu betreiben, deine Challenges und Fortschritte zu speichern, von dir gewünschte Kontakte und Erinnerungen bereitzustellen sowie den Dienst zuverlässig zu betreiben. ChallengeHub bindet derzeit kein Analyse- oder Werbetracking ein.
            </p>

            <h2>Was öffentlich sichtbar ist</h2>
            <p>
              Neue Konten erscheinen standardmäßig weder im öffentlichen Ranking noch im öffentlichen Aktivitätsfeed oder in ChallengeMate-Vorschlägen. Diese drei Freigaben kannst du getrennt im <Link href="/profil">Profil</Link> ändern. Dein privater Challenge-Raum bleibt davon unberührt.
            </p>

            <h2>Datenweitergabe</h2>
            <p>
              Daten werden für den technischen Betrieb auf dem Hosting-System verarbeitet. Erinnerungs-E-Mails werden nur bei aktivierter Funktion über den konfigurierten Versanddienst übermittelt. Es findet kein Verkauf personenbezogener Daten statt.
            </p>

            <h2>Export und Löschung</h2>
            <p>
              Im <Link href="/profil">Profil</Link> kannst du deine gespeicherten Kontodaten als maschinenlesbare JSON-Datei herunterladen. Dort kannst du dein Konto nach erneuter Passwortprüfung auch endgültig löschen.
            </p>
            <p>
              Dabei werden persönliche Konto-, Teilnahme-, Check-in-, Einladungs-, ChallengeMate- und Erinnerungsdaten entfernt. Veröffentlichte Challenges bleiben ohne Verbindung zu deinem Konto erhalten, damit Teilnahmen anderer Mitglieder nicht gelöscht werden; unveröffentlichte eigene Challenges werden entfernt. Ein nicht personenbezogener Löschvermerk hält nur Zeitpunkt und Anzahl übertragener Veröffentlichungen als Betriebsnachweis fest.
            </p>

            <h2>Speicherdauer und Rechte</h2>
            <p>
              Kontodaten bleiben bis zur Löschung des Kontos gespeichert. Sitzungen und Zurücksetzungslinks besitzen eigene Ablaufzeiten; Rate-Limit-Ereignisse werden nach Ablauf bereinigt. Verbindliche Fristen für technische Protokolle und den anonymen Löschvermerk werden im finalen Löschkonzept festgelegt.
            </p>
            <p>
              Für Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit wird vor dem Produktionsstart der Kontakt des Verantwortlichen ergänzt. Benutzername, Sichtbarkeit, Export und Kontolöschung kannst du bereits direkt im Profil verwalten.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
