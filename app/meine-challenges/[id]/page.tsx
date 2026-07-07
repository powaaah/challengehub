import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { getCheckInDatesForParticipation, getParticipationByIdForUser } from "@/lib/db";
import { checkInTodayAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge-Raum | ChallengeHub",
  description: "Dein persoenlicher Raum fuer eine gestartete Challenge.",
  robots: {
    index: false,
    follow: false
  }
};

type ChallengeRoomPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChallengeRoomPage({ params }: ChallengeRoomPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  const { id } = await params;
  const participation = getParticipationByIdForUser({
    participationId: id,
    userId: user.id
  });

  if (!participation) {
    notFound();
  }

  const checkInDates = getCheckInDatesForParticipation({
    participationId: participation.id,
    userId: user.id
  });
  const today = getTodayKey();
  const hasCheckedInToday = checkInDates.includes(today);
  const daysSinceStart = getDaysSinceStart(participation.startedAt, today);
  const missedDays = Math.max(daysSinceStart - checkInDates.length, 0);
  const completionRate = daysSinceStart > 0 ? Math.round((checkInDates.length / daysSinceStart) * 100) : 0;

  return (
    <>
      <SiteHeader user={user} />
      <main className={styles.page}>
        <section className={styles.room}>
          <Link className={styles.backLink} href="/meine-challenges">
            Zurueck zu Meine Challenges
          </Link>
          <div className={styles.hero}>
            <article className={styles.panel}>
              <p className={styles.kicker}>Challenge-Raum</p>
              <h1>{participation.challengeTitle}</h1>
              <p className={styles.goal}>{participation.challengeGoal}</p>
              <form action={checkInTodayAction}>
                <input type="hidden" name="participationId" value={participation.id} />
                <button className={styles.checkButton} type="submit" disabled={hasCheckedInToday}>
                  {hasCheckedInToday ? "Heute gespeichert" : "Challenge heute durchgefuehrt"}
                </button>
              </form>
            </article>

            <aside className={styles.panel}>
              <p className={styles.kicker}>Dein Stand</p>
              <h2>Aktiv</h2>
              <dl className={styles.stats}>
                <div>
                  <dt>Gestartet</dt>
                  <dd>{formatIsoDate(participation.startedAt)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{participation.status}</dd>
                </div>
                <div>
                  <dt>Erledigt</dt>
                  <dd>{checkInDates.length} Tage</dd>
                </div>
                <div>
                  <dt>Verpasst</dt>
                  <dd>{missedDays} Tage</dd>
                </div>
                <div>
                  <dt>Quote</dt>
                  <dd>{completionRate}%</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function formatIsoDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function getDaysSinceStart(startedAt: string, today: string) {
  const start = new Date(`${startedAt.slice(0, 10)}T12:00:00`);
  const end = new Date(`${today}T12:00:00`);
  const diff = end.getTime() - start.getTime();

  return Math.max(Math.floor(diff / 86_400_000) + 1, 1);
}
