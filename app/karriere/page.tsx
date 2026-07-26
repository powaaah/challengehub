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
  const user = await getCurrentUser();

  return (
    <>
    <SiteHeader user={user} />
    <main className={styles.page}>
      <section className={styles.content}>
        <p className={styles.kicker}>Karriere</p>
        <h1>Mitbauen an besseren Challenges.</h1>
        <p className={styles.intro}>
          ChallengeHub ist aktuell im Rebuild. Konkrete Stellen sind noch nicht
          ausgeschrieben, aber diese Seite ist als Platz für spätere Rollen,
          Partnerschaften und Mitwirkungsmöglichkeiten vorbereitet.
        </p>

        <div className={styles.panel}>
          <h2>Woran wir arbeiten</h2>
          <ul>
            <li>Challenges, die Menschen wirklich starten und durchhalten.</li>
            <li>Wissensinhalte zu Gewohnheiten, Training, Schlaf und Lernen.</li>
            <li>Ein späterer Teilnahme-Flow mit Check-ins, Streaks und Fortschritt.</li>
          </ul>

          <h2>Mögliche Bereiche</h2>
          <ul>
            <li>Content und Recherche</li>
            <li>Frontend und Produktdesign</li>
            <li>Community und Challenge-Ideen</li>
            <li>Sport, Gesundheit und Gewohnheitspsychologie</li>
          </ul>
        </div>
      </section>
    </main>
    <SiteFooter />
    </>
  );
}
