import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { habitArticles } from "@/data/habit-articles";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Wissen: Habits, Gewohnheiten und Challenges | ChallengeHub",
  description: "Lerne die wichtigsten Habit Rules fuer Challenges: Ausloeser, kleine Schritte, Belohnung, Umgebung und Wenn-Dann-Plaene.",
  alternates: {
    canonical: "/wissen"
  },
  openGraph: {
    title: "Wissen: Habits, Gewohnheiten und Challenges | ChallengeHub",
    description: "Die Wissensdatenbank fuer Gewohnheiten, Habit Rules und bessere Challenges.",
    url: "/wissen",
    type: "website"
  }
};

export default function KnowledgePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Wissen Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/wissen">Wissen</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>Habit Rules</p>
        <h1>Wissen fuer Challenges, die wirklich kleben bleiben.</h1>
        <p>
          Eine Challenge ist mehr als ein Ziel. Sie braucht Ausloeser, einfache
          Starts, sichtbaren Fortschritt und eine Umgebung, die dich nicht jeden
          Tag neu verhandeln laesst.
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
  );
}
