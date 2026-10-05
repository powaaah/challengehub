import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { privacyDataInventory } from "@/data/privacy-data-inventory";
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

            <h2>Technische Dateninventur</h2>
            <p>
              Die folgende Übersicht nennt Daten, Zweck, mögliche Empfänger und den tatsächlich implementierten Lebenszyklus. Eine Gültigkeitsdauer bedeutet nicht automatisch, dass der zugehörige Datensatz danach bereits gelöscht wird. ChallengeHub bindet derzeit kein Analyse- oder Werbetracking ein.
            </p>
            <div className={styles.inventory}>
              {privacyDataInventory.map((entry) => (
                <article className={styles.inventoryEntry} id={`daten-${entry.id}`} key={entry.id}>
                  <h3>{entry.title}</h3>
                  <dl>
                    <div>
                      <dt>Daten</dt>
                      <dd>{entry.data}</dd>
                    </div>
                    <div>
                      <dt>Zweck</dt>
                      <dd>{entry.purpose}</dd>
                    </div>
                    <div>
                      <dt>Empfänger</dt>
                      <dd>{entry.recipients}</dd>
                    </div>
                    <div>
                      <dt>Technischer Lebenszyklus</dt>
                      <dd>{entry.implementedLifecycle}</dd>
                    </div>
                  </dl>
                  {entry.reviewRequired ? (
                    <p className={styles.reviewNote}>Offener Freigabepunkt: verbindliche Frist und Rechtsgrundlage festlegen.</p>
                  ) : null}
                </article>
              ))}
            </div>

            <h2>Was öffentlich sichtbar ist</h2>
            <p>
              Neue Konten erscheinen standardmäßig weder im öffentlichen Ranking noch im öffentlichen Aktivitätsfeed oder in ChallengeMate-Vorschlägen. Diese drei Freigaben kannst du getrennt im <Link href="/profil">Profil</Link> ändern. Dein privater Challenge-Raum bleibt davon unberührt.
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
              Die oben genannten technischen Lebenszyklen beschreiben den aktuellen Code-Stand, noch keine rechtlich freigegebenen Aufbewahrungsfristen. Insbesondere für abgelaufene Sitzungen und Tokens, Einladungen, Moderationsdaten, dauerhafte Mitteilungen, Hosting-Protokolle und den anonymen Löschvermerk fehlen noch verbindliche Fristen oder automatische Löschläufe.
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
