import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getChallengeBySlug } from "@/data/challenges";
import { getCurrentUser } from "@/lib/auth";
import { getParticipationByIdForUser } from "@/lib/participations";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teilnahme bestätigt | ChallengeHub",
  description: "Deine Challenge-Teilnahme wurde gespeichert.",
  robots: {
    index: false,
    follow: false
  }
};

type ParticipationConfirmationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ teilnahme?: string | string[] }>;
};

export default async function ParticipationConfirmationPage({
  params,
  searchParams
}: ParticipationConfirmationPageProps) {
  const [{ slug }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser()
  ]);

  if (!user) {
    redirect(`/challenges/${encodeURIComponent(slug)}`);
  }

  const participationId = typeof query.teilnahme === "string" ? query.teilnahme : "";
  const participation = participationId
    ? getParticipationByIdForUser({ participationId, userId: user.id })
    : null;

  if (!participation || participation.challengeSlug !== slug) {
    notFound();
  }

  const challengeTitle = getChallengeBySlug(slug)?.title ?? participation.challengeTitle;

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.card} aria-labelledby="participation-confirmation-title">
          <p className={styles.kicker}>Teilnahme bestätigt</p>
          <h1 id="participation-confirmation-title">Danke für deine Teilnahme.</h1>
          <p className={styles.intro}>
            Du bist jetzt bei <strong>{challengeTitle}</strong> dabei. Dein
            Fortschritt, deine Check-ins und dein Platz im Ranking werden in deinem
            Challenge-Raum gespeichert.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={`/meine-challenges/${participation.id}`}>
              Zum Dashboard
            </Link>
            <Link className={styles.secondaryAction} href={`/challenges/${participation.challengeSlug}`}>
              Zurück zur Challenge
            </Link>
            <Link className={styles.secondaryAction} href="/challenge-mate">
              Challenge-Partner finden
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
