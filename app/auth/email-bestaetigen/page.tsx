import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { verifyEmailForToken } from "@/lib/email-verifications";
import styles from "../password-reset.module.css";

export const metadata: Metadata = {
  title: "E-Mail bestätigen | ChallengeHub",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type EmailVerificationPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function EmailVerificationPage({ searchParams }: EmailVerificationPageProps) {
  const value = (await searchParams).token;
  const token = typeof value === "string" ? value : "";
  const result = verifyEmailForToken(token);
  const user = await getCurrentUser();
  const verified = result.status === "verified" || result.status === "already_verified";

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <section className={styles.card}>
          <p className={styles.kicker}>Kontozugang</p>
          <h1>{verified ? "E-Mail-Adresse bestätigt" : "Link nicht mehr gültig"}</h1>
          <p className={styles.intro}>
            {verified
              ? "Deine Adresse ist bestätigt. Du kannst ChallengeHub direkt weiter nutzen."
              : "Der Link wurde bereits verwendet, ist abgelaufen oder unvollständig. Fordere im Profil einen neuen an."}
          </p>
          <Link className={styles.primaryLink} href={user ? "/profil" : "/"}>
            {user ? "Zum Profil" : "Zur Startseite"}
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
