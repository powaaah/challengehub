import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AuthForms } from "@/components/auth-forms";
import { SiteHeader } from "@/components/challenge-hub-app";
import { logoutAction } from "./actions";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Login und Registrierung | ChallengeHub",
  description: "Registriere dich oder logge dich ein, um Challenges serverseitig zu speichern."
};

type AuthPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getCurrentUser();
  const { next = "/" } = await searchParams;

  return (
    <>
      <SiteHeader user={user} />
      <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Account</p>
        <h1>Dein Fortschritt gehoert dir.</h1>
        <p>
          Mit einem Account werden neue Challenges serverseitig gespeichert. Check-ins und Teilnahmen
          ziehen wir im naechsten Slice ebenfalls auf dieselbe Persistenz.
        </p>
      </section>

      {user ? (
        <section className={styles.signedIn}>
          <p className={styles.kicker}>Eingeloggt</p>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <div className={styles.actions}>
            <Link href="/challenges">Challenges suchen</Link>
            <form action={logoutAction}>
              <button type="submit">Logout</button>
            </form>
          </div>
        </section>
      ) : (
        <AuthForms next={next} />
      )}
      </main>
    </>
  );
}
