import type { Metadata } from "next";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../password-reset.module.css";

export const metadata: Metadata = {
  title: "Passwort vergessen | ChallengeHub",
  robots: { index: false, follow: false }
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <section className={styles.card}>
          <p className={styles.kicker}>Account-Zugang</p>
          <h1>Passwort zurücksetzen</h1>
          <p className={styles.intro}>
            Gib deine E-Mail-Adresse ein. Wenn ein Konto existiert, senden wir dir einen einmalig
            nutzbaren Link, der 30 Minuten gültig ist.
          </p>
          <PasswordResetRequestForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
