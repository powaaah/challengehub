import { pageContent } from "@/data/pages.generated";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Sicherheit und Gesundheit | ChallengeHub",
  description: "Sicherheitshinweise für Fitness-, Ernährungs-, Schlaf- und Gewohnheits-Challenges auf ChallengeHub.",
  alternates: {
    canonical: "/sicherheit"
  }
};

export const dynamic = "force-dynamic";

export default async function SicherheitPage() {
  const copy = pageContent.sicherheit;
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>{copy["sicherheit"]}</p>
        <h1>{copy["gesundheit-geht-vor-challenge"]}</h1>
        <p className={styles.intro}>{copy["challengehub-motiviert-zu-zielen-gewohnheiten-und"]}</p>

        <div className={styles.warning}>
          <h2>{copy["wichtiger-hinweis"]}</h2>
          <p>{copy["starte-intensive-challenges-nur-wenn-sie"]}</p>
        </div>

        <div className={styles.panel}>
          <h2>{copy["grundregeln-fur-sichere-challenges"]}</h2>
          <ul>
            <li>{copy["brich-eine-challenge-ab-wenn-schmerzen"]}</li>
            <li>{copy["steigere-belastung-schrittweise-statt-sprunghaft"]}</li>
            <li>{copy["schlaf-regeneration-und-essen-sind-teil"]}</li>
            <li>{copy["extreme-challenges-sind-nicht-automatisch-bessere"]}</li>
            <li>{copy["vergleiche-dich-nicht-blind-mit-anderen"]}</li>
            <li>{copy["bei-ernahrungszielen-steht-nachhaltiges-verhalten-vor"]}</li>
          </ul>

          <h2>{copy["besonders-vorsichtig-bei"]}</h2>
          <ul>
            <li>{copy["maximalkraft-und-sehr-schweren-kraftzielen"]}</li>
            <li>{copy["extremen-kalorien-oder-verzichts-challenges"]}</li>
            <li>{copy["langen-ausdauerbelastungen-ohne-trainingsgrundlage"]}</li>
            <li>{copy["challenges-die-schlaf-dauerhaft-reduzieren"]}</li>
            <li>{copy["challenges-die-druck-schuldgefuhle-oder-kontrollverlust"]}</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
