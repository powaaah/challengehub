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
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>Sicherheit</p>
        <h1>Gesundheit geht vor Challenge.</h1>
        <p className={styles.intro}>
          ChallengeHub motiviert zu Zielen, Gewohnheiten und Training. Die Inhalte
          sind aber keine medizinische, psychologische, ernährungswissenschaftliche
          oder sporttherapeutische Beratung.
        </p>

        <div className={styles.warning}>
          <h2>Wichtiger Hinweis</h2>
          <p>
            Starte intensive Challenges nur, wenn sie zu deiner Gesundheit, deinem
            Trainingsstand und deiner Lebenssituation passen. Bei Vorerkrankungen,
            Schmerzen, Schwangerschaft, Essstörungen, Herz-Kreislauf-Themen oder
            Unsicherheit solltest du vorher fachlichen Rat einholen.
          </p>
        </div>

        <div className={styles.panel}>
          <h2>Grundregeln für sichere Challenges</h2>
          <ul>
            <li>Brich eine Challenge ab, wenn Schmerzen, Schwindel, Atemnot oder starkes Unwohlsein auftreten.</li>
            <li>Steigere Belastung schrittweise statt sprunghaft.</li>
            <li>Schlaf, Regeneration und Essen sind Teil der Performance.</li>
            <li>Extreme Challenges sind nicht automatisch bessere Challenges.</li>
            <li>Vergleiche dich nicht blind mit anderen Teilnehmern.</li>
            <li>Bei Ernährungszielen steht nachhaltiges Verhalten vor extremen Einzeltagen.</li>
          </ul>

          <h2>Besonders vorsichtig bei</h2>
          <ul>
            <li>Maximalkraft- und sehr schweren Kraftzielen</li>
            <li>extremen Kalorien- oder Verzichts-Challenges</li>
            <li>langen Ausdauerbelastungen ohne Trainingsgrundlage</li>
            <li>Challenges, die Schlaf dauerhaft reduzieren</li>
            <li>Challenges, die Druck, Schuldgefühle oder Kontrollverlust auslösen</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
