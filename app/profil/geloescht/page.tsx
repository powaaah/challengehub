import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import styles from "@/components/profile-app.module.css";

export const metadata: Metadata = {
  title: "Konto gelöscht | ChallengeHub",
  robots: { index: false, follow: false }
};

export default function AccountDeletedPage() {
  return (
    <>
      <SiteHeader user={null} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.heading}>
          <p>Abgeschlossen</p>
          <h1>Dein Konto wurde gelöscht</h1>
          <span>Deine persönlichen Kontodaten und deine Teilnahmeverläufe wurden entfernt.</span>
          <Link className={styles.primaryLink} href="/">Zur Startseite</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
