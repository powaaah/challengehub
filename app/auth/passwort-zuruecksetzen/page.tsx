import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/password-reset-form";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import styles from "../password-reset.module.css";

export const metadata: Metadata = {
  title: "Neues Passwort | ChallengeHub",
  robots: { index: false, follow: false }
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const user = await getCurrentUser();
  const value = (await searchParams).token;
  const token = typeof value === "string" ? value : "";

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <section className={styles.card}>
          <p className={styles.kicker}>Account-Zugang</p>
          <h1>Neues Passwort festlegen</h1>
          <p className={styles.intro}>
            Wähle ein neues Passwort mit mindestens acht Zeichen. Der Link kann nur einmal
            verwendet werden.
          </p>
          <PasswordResetForm token={token} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
