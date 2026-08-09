import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChallengeHistory } from "@/components/challenge-history";
import { ChallengeInvitation } from "@/components/challenge-invitation";
import { ChallengeRankingTable } from "@/components/challenge-ranking-table";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { buildChallengeHistory, calculateChallengeProgress } from "@/lib/challenge-progress";
import { calculateChallengeOutcome, formatMetricValue } from "@/domain/challenges/challenge-outcome";
import { getChallengeRankingBySlug } from "@/lib/challenge-participation-stats";
import {
  getCheckInsForParticipation,
  getParticipationByIdForUser
} from "@/lib/participations";
import { checkInTodayAction, leaveChallengeAction } from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge-Raum | ChallengeHub",
  description: "Dein persönlicher Raum für eine gestartete Challenge.",
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

  const isActive = participation.status === "active";

  const checkIns = getCheckInsForParticipation({
    participationId: participation.id,
    userId: user.id
  });
  const checkInDates = checkIns.map((checkIn) => checkIn.date);
  const today = getTodayKey();
  const progress = calculateChallengeProgress({
    startedAt: participation.startedAt,
    checkInDates,
    today
  });
  const history = buildChallengeHistory({
    startedAt: participation.startedAt,
    checkInDates,
    today
  });
  const outcome = calculateChallengeOutcome({ definition: participation.definition, checkIns });
  const isDailyChallenge = participation.definition.type === "daily_boolean";
  const metricDefinition = participation.definition.type === "daily_boolean"
    ? null
    : participation.definition;
  const ranking = getChallengeRankingBySlug(participation.challengeSlug, today);
  const ownRanking = ranking.find((entry) => entry.id === participation.id);

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.room}>
          <Link className={styles.backLink} href="/meine-challenges">
            Zurück zu Meine Challenges
          </Link>
          <div className={styles.hero}>
            <article className={styles.panel}>
              <p className={styles.kicker}>Challenge-Raum</p>
              <h1>{participation.challengeTitle}</h1>
              <p className={styles.goal}>{participation.challengeGoal}</p>
              {isActive && isDailyChallenge ? (
                <form action={checkInTodayAction}>
                  <input type="hidden" name="participationId" value={participation.id} />
                  <button className={styles.checkButton} type="submit" disabled={progress.hasCheckedInToday}>
                    {progress.hasCheckedInToday ? "Heute gespeichert" : "Challenge heute durchgeführt"}
                  </button>
                </form>
              ) : isActive && metricDefinition ? (
                <form action={checkInTodayAction}>
                  <input type="hidden" name="participationId" value={participation.id} />
                  <label>
                    {metricDefinition.type === "cumulative_metric" ? "Wert hinzufügen" : "Ergebnis eintragen"}
                    <input
                      type="number"
                      name="value"
                      min="0.01"
                      step="any"
                      required
                      disabled={progress.hasCheckedInToday}
                    />
                  </label>
                  <p className={styles.note}>
                    Ziel: {metricDefinition.direction === "at_most" ? "höchstens" : "mindestens"}{" "}
                    {formatMetricValue(metricDefinition.targetValue, metricDefinition.unit)}
                  </p>
                  <button className={styles.checkButton} type="submit" disabled={progress.hasCheckedInToday}>
                    {progress.hasCheckedInToday ? "Heute gespeichert" : "Messwert speichern"}
                  </button>
                </form>
              ) : (
                <p className={styles.note}>Diese Teilnahme ist beendet. Dein bisheriger Verlauf bleibt sichtbar.</p>
              )}
            </article>

            <aside className={styles.panel}>
              <p className={styles.kicker}>Dein Stand</p>
              <h2>{isActive ? "Aktiv" : "Beendet"}</h2>
              <dl className={styles.stats}>
                <div>
                  <dt>Gestartet</dt>
                  <dd>{formatIsoDate(participation.startedAt)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{isActive ? "Aktiv" : "Beendet"}</dd>
                </div>
                {participation.completedAt ? (
                  <div>
                    <dt>Beendet</dt>
                    <dd>{formatIsoDate(participation.completedAt)}</dd>
                  </div>
                ) : null}
                {isDailyChallenge ? (
                  <>
                    <div><dt>Erledigt</dt><dd>{progress.fulfilledDays} Tage</dd></div>
                    <div><dt>Verpasst</dt><dd>{progress.missedDays} Tage</dd></div>
                    <div><dt>Aktuelle Serie</dt><dd>{progress.currentStreak} Tage</dd></div>
                    <div><dt>Längste Serie</dt><dd>{progress.longestStreak} Tage</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>Messungen</dt><dd>{checkIns.length}</dd></div>
                    <div><dt>Ergebnis</dt><dd>{outcome.label}</dd></div>
                    <div><dt>Ziel erreicht</dt><dd>{outcome.completed ? "Ja" : "Noch nicht"}</dd></div>
                  </>
                )}
                <div>
                  <dt>Quote</dt>
                  <dd>
                    {isDailyChallenge
                      ? progress.completionRate
                      : outcome.completionRate}
                    %
                  </dd>
                </div>
                <div>
                  <dt>Rang</dt>
                  <dd>{ownRanking ? `#${ownRanking.rank}` : "-"}</dd>
                </div>
              </dl>
            </aside>
          </div>

          {isDailyChallenge ? <ChallengeHistory days={history} /> : null}

          {isActive && isDailyChallenge ? (
            <section className={styles.reminder} aria-labelledby="calendar-reminder">
              <div>
                <p className={styles.kicker}>Erinnerung</p>
                <h2 id="calendar-reminder">Täglich an deine Challenge denken</h2>
                <p>
                  Lade einen täglichen Kalendereintrag für 18 Uhr herunter. Die Uhrzeit kannst du anschließend
                  in deiner Kalender-App ändern.
                </p>
              </div>
              <a href={`/meine-challenges/${participation.id}/erinnerung`} download>
                Kalender-Erinnerung herunterladen
              </a>
            </section>
          ) : null}

          <section aria-labelledby="room-ranking">
            <p className={styles.kicker}>Wettbewerb</p>
            <h2 id="room-ranking">Ranking dieser Challenge</h2>
            <ChallengeRankingTable entries={ranking} currentParticipationId={participation.id} />
          </section>

          {isActive ? <ChallengeInvitation participationId={participation.id} /> : null}

          {isActive ? (
            <details className={styles.dangerZone}>
              <summary>Challenge verlassen</summary>
              <div>
                <h2>Teilnahme wirklich beenden?</h2>
                <p>Deine bisherigen Check-ins bleiben als Verlauf erhalten.</p>
                <p>Neue Check-ins und Einladungen sind danach nicht mehr möglich.</p>
                <form action={leaveChallengeAction}>
                  <input type="hidden" name="participationId" value={participation.id} />
                  <button type="submit">Teilnahme endgültig beenden</button>
                </form>
              </div>
            </details>
          ) : null}
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
