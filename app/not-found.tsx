import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <>
      <SiteHeader user={null} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.card}>
          <p className={styles.code}>404</p>
          <h1>Challenge nicht gefunden</h1>
          <p>
            Diese Challenge existiert nicht, wurde entfernt oder wartet noch auf ihre Freigabe.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/challenges">Challenges entdecken</Link>
            <Link className={styles.secondary} href="/">Zur Startseite</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
