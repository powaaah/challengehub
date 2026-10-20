import { pageContent } from "@/data/pages.generated";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../legal-pages.module.css";

export const metadata: Metadata = {
  title: "Karriere | ChallengeHub",
  description: "Karriere und Mitwirkungsmöglichkeiten bei ChallengeHub.",
  alternates: {
    canonical: "/karriere"
  }
};

export const dynamic = "force-dynamic";

export default async function KarrierePage() {
  const copy = pageContent.karriere;
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>{copy["karriere"]}</p>
        <h1>{copy["mitbauen-an-besseren-challenges"]}</h1>
        <p className={styles.intro}>{copy["challengehub-ist-aktuell-im-rebuild-konkrete"]}</p>

        <div className={styles.panel}>
          <h2>{copy["woran-wir-arbeiten"]}</h2>
          <ul>
            <li>{copy["challenges-die-menschen-wirklich-starten-und"]}</li>
            <li>{copy["wissensinhalte-zu-gewohnheiten-training-schlaf-und"]}</li>
            <li>{copy["ein-spaterer-teilnahme-flow-mit-check"]}</li>
          </ul>

          <h2>{copy["mogliche-bereiche"]}</h2>
          <ul>
            <li>{copy["content-und-recherche"]}</li>
            <li>{copy["frontend-und-produktdesign"]}</li>
            <li>{copy["community-und-challenge-ideen"]}</li>
            <li>{copy["sport-gesundheit-und-gewohnheitspsychologie"]}</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
