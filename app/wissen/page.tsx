import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { habitArticles } from "@/data/habit-articles";
import { getCurrentUser } from "@/lib/auth";
import { buildKnowledgeCatalogJsonLd } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Wissen: Habits, Gewohnheiten und Challenges | ChallengeHub",
  description: "Lerne die wichtigsten Habit Rules für Challenges: Auslöser, kleine Schritte, Belohnung, Umgebung und Wenn-Dann-Pläne.",
  alternates: {
    canonical: "/wissen"
  },
  openGraph: {
    title: "Wissen: Habits, Gewohnheiten und Challenges | ChallengeHub",
    description: "Die Wissensdatenbank für Gewohnheiten, Habit Rules und bessere Challenges.",
    url: "/wissen",
    type: "website"
  }
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  const catalogJsonLd = buildKnowledgeCatalogJsonLd(habitArticles);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(catalogJsonLd).replace(/</g, "\\u003c")
        }}
      />
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Habit Rules</p>
          <h1>Wissen für Challenges, die wirklich kleben bleiben.</h1>
          <p>
            Eine Challenge ist mehr als ein Ziel. Sie braucht Auslöser, einfache
            Starts, sichtbaren Fortschritt und eine Umgebung, die dich nicht jeden
            Tag neu verhandeln lässt.
          </p>
        </section>

        <section className={styles.grid} aria-label="Habit-Wissen Artikel">
          {habitArticles.map((article) => (
            <Link className={styles.card} href={`/wissen/${article.slug}`} key={article.slug}>
              <span>{article.category}</span>
              <h2>{article.title}</h2>
              <p>{article.excerpt}</p>
              <small>{article.readTime}</small>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
