import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { AuthForms } from "@/components/auth-forms";
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
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.logoLink} href="/" aria-label="ChallengeHub Startseite">
          <Image src="/logo.png" width={214} height={70} alt="ChallengeHub" priority />
        </Link>
        <nav className={styles.nav} aria-label="Account Navigation">
          <Link href="/#challenges">Challenges</Link>
          <Link href="/challenges/neu">Erstellen</Link>
          <Link href="/meine-challenges">Meine Challenges</Link>
        </nav>
      </header>

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
            <Link href="/challenges/neu">Challenge erstellen</Link>
            <form action={logoutAction}>
              <button type="submit">Logout</button>
            </form>
          </div>
        </section>
      ) : (
        <AuthForms next={next} />
      )}
    </main>
  );
}
