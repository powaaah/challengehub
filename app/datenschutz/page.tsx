import { pageContent } from "@/data/pages.generated";
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
  const copy = pageContent.datenschutz;
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.content}>
          <p className={styles.kicker}>{copy["rechtliches"]}</p>
          <h1>{copy["datenschutz"]}</h1>
          <p className={styles.intro}>{copy["hier-erfahrst-du-welche-daten-challengehub"]}</p>

          <div className={styles.warning}>
            <h2>{copy["aktueller-technischer-stand"]}</h2>
            <p>{copy["diese-beschreibung-bildet-die-implementierten-funktionen"]}</p>
          </div>

          <div className={styles.panel}>
            <h2>{copy["verantwortlicher"]}</h2>
            <div className={styles.placeholder}>
              <code>{copy["name-firma"]}</code><span>{copy["verantwortlicher-name"]}</span>
              <code>{copy["kontakt"]}</code><span>{copy["verantwortlicher-kontakt"]}</span>
            </div>

            <h2>{copy["technische-dateninventur"]}</h2>
            <p>{copy["die-folgende-ubersicht-nennt-daten-zweck"]}</p>
            <div className={styles.inventory}>
              {privacyDataInventory.map((entry) => (
                <article className={styles.inventoryEntry} id={`daten-${entry.id}`} key={entry.id}>
                  <h3>{entry.title}</h3>
                  <dl>
                    <div>
                      <dt>{copy["daten"]}</dt>
                      <dd>{entry.data}</dd>
                    </div>
                    <div>
                      <dt>{copy["zweck"]}</dt>
                      <dd>{entry.purpose}</dd>
                    </div>
                    <div>
                      <dt>{copy["empfanger"]}</dt>
                      <dd>{entry.recipients}</dd>
                    </div>
                    <div>
                      <dt>{copy["technischer-lebenszyklus"]}</dt>
                      <dd>{entry.implementedLifecycle}</dd>
                    </div>
                  </dl>
                  {entry.reviewRequired ? (
                    <p className={styles.reviewNote}>{copy["offener-freigabepunkt-verbindliche-frist-und-rechtsgrundlage"]}</p>
                  ) : null}
                </article>
              ))}
            </div>

            <h2>{copy["was-offentlich-sichtbar-ist"]}</h2>
            <p>{copy["neue-konten-erscheinen-standardmaig-weder-im"]}{" "}<Link href="/profil">{copy["profil"]}</Link>{" "}{copy["andern-dein-privater-challenge-raum-bleibt"]}</p>

            <h2>{copy["export-und-loschung"]}</h2>
            <p>{copy["im"]}{" "}<Link href="/profil">{copy["profil"]}</Link>{" "}{copy["kannst-du-deine-gespeicherten-kontodaten-als"]}</p>
            <p>{copy["dabei-werden-personliche-konto-teilnahme-check"]}</p>

            <h2>{copy["speicherdauer-und-rechte"]}</h2>
            <p>{copy["die-oben-genannten-technischen-lebenszyklen-beschreiben"]}</p>
            <p>{copy["fur-auskunft-berichtigung-loschung-einschrankung-widerspruch"]}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
