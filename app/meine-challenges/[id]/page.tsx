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
import {
  markRetentionNotificationReadAction,
  updateRetentionPreferencesAction
} from "./actions";
import { getRetentionDashboard } from "@/lib/retention";
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
  searchParams: Promise<{
    retention?: string | string[];
  }>;
};

export default async function ChallengeRoomPage({ params, searchParams }: ChallengeRoomPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth?next=/meine-challenges");
  }

  const [{ id }, query] = await Promise.all([params, searchParams]);
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
  const retention = getRetentionDashboard({
    userId: user.id,
    participationId: participation.id,
    today
  });
  const retentionStatus = typeof query.retention === "string" ? query.retention : "";

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

          {retention ? (
            <section className={styles.retention} aria-labelledby="retention-feed-title">
              <div className={styles.retentionHeader}>
                <div>
                  <p className={styles.kicker}>Dranbleiben</p>
                  <h2 id="retention-feed-title">Dein Dranbleib-Feed</h2>
                  <p>Nur echte Ereignisse aus deiner Teilnahme und deinem ChallengeMate-Match.</p>
                </div>
                {retentionStatus === "saved" ? (
                  <p className={styles.success} role="status">Erinnerungen gespeichert</p>
                ) : retentionStatus === "read" ? (
                  <p className={styles.success} role="status">Meldung als gelesen markiert</p>
                ) : null}
              </div>

              {retention.notifications.length > 0 ? (
                <ol className={styles.notificationList}>
                  {retention.notifications.map((notification) => (
                    <li
                      className={notification.readAt ? styles.notificationRead : styles.notification}
                      key={notification.id}
                    >
                      <div>
                        <p className={styles.notificationMeta}>
                          {formatNotificationType(notification.type)} · {formatIsoDate(notification.occurredAt)}
                        </p>
                        <h3>{notification.title}</h3>
                        <p>{notification.body}</p>
                      </div>
                      <div className={styles.notificationActions}>
                        <Link href={notification.href}>Jetzt öffnen</Link>
                        {!notification.readAt ? (
                          <form action={markRetentionNotificationReadAction}>
                            <input type="hidden" name="participationId" value={participation.id} />
                            <input type="hidden" name="notificationId" value={notification.id} />
                            <button type="submit">Als gelesen markieren</button>
                          </form>
                        ) : <span>Gelesen</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.retentionEmpty}>
                  {retention.preferences.inAppEnabled
                    ? "Gerade ist nichts offen. Dein nächstes echtes Ereignis erscheint hier."
                    : "In-App-Erinnerungen sind pausiert."}
                </p>
              )}

              <details className={styles.retentionSettings}>
                <summary>Erinnerungen einstellen</summary>
                <form action={updateRetentionPreferencesAction}>
                  <input type="hidden" name="participationId" value={participation.id} />
                  <label>
                    <input
                      type="checkbox"
                      name="inAppEnabled"
                      value="yes"
                      defaultChecked={retention.preferences.inAppEnabled}
                    />
                    <span><strong>In-App-Erinnerungen</strong><small>Offene Check-ins und relevante Ereignisse hier anzeigen.</small></span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="emailReminderEnabled"
                      value="yes"
                      defaultChecked={retention.preferences.emailReminderEnabled}
                    />
                    <span><strong>Tägliche E-Mail-Erinnerung</strong><small>Nur wenn dein Check-in noch offen ist oder du neu einsteigen kannst.</small></span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="weeklyRecapEnabled"
                      value="yes"
                      defaultChecked={retention.preferences.weeklyRecapEnabled}
                    />
                    <span><strong>Wöchentlicher Rückblick per E-Mail</strong><small>Eine sachliche Zusammenfassung deiner letzten sieben Tage.</small></span>
                  </label>
                  <p>E-Mail-Erinnerungen sind freiwillig und über jede Nachricht direkt abbestellbar.</p>
                  <button type="submit">Einstellungen speichern</button>
                </form>
              </details>
            </section>
          ) : null}

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

function formatNotificationType(type: string) {
  const labels: Record<string, string> = {
    daily_reminder: "Heute",
    weekly_recap: "Wochenrückblick",
    mate_request: "ChallengeMate",
    mate_matched: "ChallengeMate",
    reactivation: "Neuer Einstieg",
    completion_badge: "Abschluss"
  };
  return labels[type] ?? "Aktivität";
}
