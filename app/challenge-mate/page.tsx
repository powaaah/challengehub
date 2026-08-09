import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge Mate finden | ChallengeHub",
  description: "Finde später Menschen in deiner Stadt, die an ähnlichen Zielen arbeiten."
};

export default async function ChallengeMatePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/challenge-mate");
  }

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Challenge Mate</p>
          <h1>Finde Menschen, die in deiner Stadt an ähnlichen Zielen arbeiten.</h1>
          <p>
            Diese Funktion ist vorbereitet. Später kannst du Stadt, Radius und Interessen
            hinterlegen, um passende Challenge Mates zu finden.
          </p>
        </section>

        <section className={styles.panel}>
          <h2>Geplanter Ablauf</h2>
          <ul>
            <li>Du gibst deine Stadt oder einen groben Umkreis an.</li>
            <li>Du wählst Interessen, Ziele oder aktive Challenge-Kategorien aus.</li>
            <li>ChallengeHub zeigt passende Nutzer mit ähnlichen Zielen.</li>
            <li>Kontakt entsteht erst, wenn beide Seiten Interesse zeigen.</li>
          </ul>
          <Link href="/challenges">Erstmal passende Challenge suchen</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
