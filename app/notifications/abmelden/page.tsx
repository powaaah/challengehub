import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { verifyRetentionUnsubscribeToken } from "@/lib/retention-unsubscribe";
import { unsubscribeRetentionEmailAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Mail-Erinnerungen abmelden | ChallengeHub",
  robots: { index: false, follow: false }
};

export default async function RetentionUnsubscribePage({ searchParams }: {
  searchParams: Promise<{ token?: string | string[]; status?: string | string[] }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const token = typeof query.token === "string" ? query.token : "";
  const status = typeof query.status === "string" ? query.status : "";
  const valid = token ? verifyRetentionUnsubscribeToken(token) !== null : false;

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.card} aria-labelledby="unsubscribe-title">
          <p className={styles.kicker}>Erinnerungen</p>
          <h1 id="unsubscribe-title">E-Mail-Erinnerungen verwalten</h1>
          {status === "done" ? (
            <>
              <p>Die täglichen Erinnerungen und Wochenrückblicke für diese Teilnahme sind abbestellt.</p>
              <Link href="/meine-challenges">Zu Meine Challenges</Link>
            </>
          ) : valid ? (
            <>
              <p>Du kannst beide E-Mail-Arten für diese Teilnahme mit einem Schritt abbestellen.</p>
              <form action={unsubscribeRetentionEmailAction}>
                <input type="hidden" name="token" value={token} />
                <button type="submit">E-Mails abbestellen</button>
              </form>
            </>
          ) : (
            <>
              <p>Dieser Abmeldelink ist ungültig. Deine Einstellungen kannst du weiterhin im Challenge-Raum ändern.</p>
              <Link href="/meine-challenges">Zu Meine Challenges</Link>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
