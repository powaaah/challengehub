import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ChallengeMateConnectionView, ChallengeMateProfile } from "@/domain/challenge-mates/challenge-mate";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getCurrentUser } from "@/lib/auth";
import { getChallengeMateDashboard } from "@/lib/challenge-mates";
import { getParticipationsForUser } from "@/lib/participations";
import {
  acceptChallengeMateAction,
  blockChallengeMateAction,
  deactivateChallengeMateProfileAction,
  reportChallengeMateAction,
  requestChallengeMateAction,
  saveChallengeMateProfileAction
} from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ChallengeMate finden | ChallengeHub",
  description: "Finde einen passenden ChallengeMate und bestätigt eure Verbindung gegenseitig.",
  robots: { index: false, follow: true }
};

const statusMessages: Record<string, string> = {
  profile_saved: "Suche aktiv",
  profile_paused: "Suche pausiert",
  request_sent: "Anfrage gesendet",
  match_confirmed: "Match bestätigt",
  user_reported: "Meldung gespeichert",
  user_blocked: "Nutzer blockiert",
  invalid_profile: "Bitte prüfe Ziel, Zeitraum und Ortsangabe.",
  invalid_participation: "Diese aktive Challenge ist nicht mehr verfügbar.",
  active_match_conflict: "Beende oder blockiere dein bestehendes Match, bevor du die Challenge wechselst.",
  action_failed: "Die Aktion konnte nicht ausgeführt werden. Bitte lade die Seite neu."
};

export default async function ChallengeMatePage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/challenge-mate");

  const [{ status }, participations] = await Promise.all([
    searchParams,
    Promise.resolve(getParticipationsForUser(user.id))
  ]);
  const activeParticipations = participations.filter((participation) => participation.status === "active");
  const dashboard = getChallengeMateDashboard(user.id);
  const message = status ? statusMessages[status] : null;

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.kicker}>ChallengeMate</p>
          <h1>Finde deinen ChallengeMate</h1>
          <p>
            Wähle eine aktive Challenge und finde Menschen mit demselben Ziel. Sichtbar wirst du
            nur nach deinem Opt-in; eine Verbindung entsteht erst, wenn beide bestätigen.
          </p>
        </section>

        {message ? <p className={styles.status} role="status">{message}</p> : null}

        {activeParticipations.length === 0 ? (
          <section className={styles.emptyState}>
            <p className={styles.eyebrow}>Erster Schritt</p>
            <h2>Starte zuerst eine Challenge</h2>
            <p>ChallengeMate verbindet nur Menschen, die an derselben aktiven Challenge arbeiten.</p>
            <Link href="/challenges">Challenges entdecken</Link>
          </section>
        ) : (
          <section className={styles.setup} aria-labelledby="mate-search-heading">
            <div>
              <p className={styles.eyebrow}>Dein Opt-in</p>
              <h2 id="mate-search-heading">Wonach suchst du?</h2>
              <p>Andere sehen nur deinen Benutzernamen, dein Ziel, den Zeitraum und Remote oder den groben Ort.</p>
            </div>
            <form action={saveChallengeMateProfileAction} className={styles.form}>
              <label>
                Aktive Challenge
                <select name="participationId" defaultValue={dashboard.profile?.participationId ?? ""} required>
                  <option value="" disabled>Challenge wählen</option>
                  {activeParticipations.map((participation) => (
                    <option key={participation.id} value={participation.id}>{participation.challengeTitle}</option>
                  ))}
                </select>
              </label>
              <label className={styles.fullField}>
                Dein gemeinsames Ziel
                <textarea
                  name="goal"
                  minLength={20}
                  maxLength={200}
                  defaultValue={dashboard.profile?.goal ?? ""}
                  placeholder="Zum Beispiel: Wir checken jeden Abend ein und motivieren uns bei einem verpassten Tag."
                  required
                />
              </label>
              <label>
                Verfügbar ab
                <input name="availableFrom" type="date" defaultValue={dashboard.profile?.availableFrom ?? ""} required />
              </label>
              <label>
                Verfügbar bis
                <input name="availableUntil" type="date" defaultValue={dashboard.profile?.availableUntil ?? ""} required />
              </label>
              <fieldset className={styles.fullField}>
                <legend>Wie wollt ihr euch unterstützen?</legend>
                <label className={styles.radioLabel}>
                  <input name="mode" type="radio" value="remote" defaultChecked={dashboard.profile?.mode !== "local"} />
                  Remote
                </label>
                <label className={styles.radioLabel}>
                  <input name="mode" type="radio" value="local" defaultChecked={dashboard.profile?.mode === "local"} />
                  Vor Ort
                </label>
              </fieldset>
              <label className={styles.fullField}>
                Grober Ort – nur bei „Vor Ort“
                <input name="location" maxLength={80} defaultValue={dashboard.profile?.location ?? ""} placeholder="Zum Beispiel Berlin" />
              </label>
              <div className={`${styles.formActions} ${styles.fullField}`}>
                <button type="submit">{dashboard.profile?.active ? "Suche aktualisieren" : "Suche aktivieren"}</button>
              </div>
            </form>
            {dashboard.profile?.active ? (
              <form action={deactivateChallengeMateProfileAction} className={styles.pauseForm}>
                <button type="submit">Suche pausieren</button>
              </form>
            ) : null}
          </section>
        )}

        {dashboard.matches.length > 0 ? (
          <ConnectionSection title="Gemeinsam dranbleiben" entries={dashboard.matches} kind="match" />
        ) : null}

        {dashboard.profile?.active ? (
          <>
            {dashboard.incoming.length > 0 ? (
              <ConnectionSection title="Offene Anfragen" entries={dashboard.incoming} kind="incoming" />
            ) : null}
            <section className={styles.results} aria-labelledby="suggestions-heading">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.eyebrow}>Kompatible Profile</p>
                  <h2 id="suggestions-heading">Deine Vorschläge</h2>
                </div>
                <p>{dashboard.suggestions.length} passend</p>
              </div>
              {dashboard.suggestions.length === 0 ? (
                <div className={styles.emptyInline}>
                  <strong>Noch keine passenden Vorschläge</strong>
                  <span>Deine Suche bleibt aktiv. Neue kompatible Opt-ins erscheinen automatisch.</span>
                </div>
              ) : (
                <div className={styles.cardGrid}>
                  {dashboard.suggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.userId} suggestion={suggestion} />
                  ))}
                </div>
              )}
            </section>
            {dashboard.outgoing.length > 0 ? (
              <ConnectionSection title="Gesendete Anfragen" entries={dashboard.outgoing} kind="outgoing" />
            ) : null}
          </>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function SuggestionCard({ suggestion }: { suggestion: ChallengeMateProfile }) {
  return (
    <article className={styles.card}>
      <MateCardBody
        name={suggestion.userName}
        goal={suggestion.goal}
        challengeTitle={suggestion.challengeTitle}
        mode={suggestion.mode}
        location={suggestion.location}
        availableFrom={suggestion.availableFrom}
        availableUntil={suggestion.availableUntil}
      />
      <form action={requestChallengeMateAction}>
        <input type="hidden" name="recipientUserId" value={suggestion.userId} />
        <button type="submit" aria-label={`Interesse an ${suggestion.userName} senden`}>Interesse senden</button>
      </form>
    </article>
  );
}

function ConnectionSection({
  title,
  entries,
  kind
}: {
  title: string;
  entries: ChallengeMateConnectionView[];
  kind: "incoming" | "outgoing" | "match";
}) {
  return (
    <section className={styles.results} aria-labelledby={`mate-${kind}`}>
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>{kind === "match" ? "Bestätigt" : "Interesse"}</p>
          <h2 id={`mate-${kind}`}>{title}</h2>
        </div>
      </div>
      <div className={styles.cardGrid}>
        {entries.map((entry) => (
          <article className={`${styles.card} ${kind === "match" ? styles.matchCard : ""}`} key={entry.connectionId}>
            <MateCardBody
              name={entry.mateName}
              goal={entry.mateGoal}
              challengeTitle={entry.challengeTitle}
              mode={entry.mode}
              location={entry.location}
            />
            {kind === "incoming" ? (
              <form action={acceptChallengeMateAction}>
                <input type="hidden" name="connectionId" value={entry.connectionId} />
                <button type="submit" aria-label={`Match mit ${entry.mateName} bestätigen`}>Match bestätigen</button>
              </form>
            ) : null}
            {kind === "outgoing" ? <p className={styles.pending}>Wartet auf Bestätigung</p> : null}
            {kind === "match" ? (
              <>
                <Link className={styles.challengeLink} href={`/challenges/${entry.challengeSlug}`}>Gemeinsame Challenge öffnen</Link>
                <MateControls entry={entry} />
              </>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function MateControls({ entry }: { entry: ChallengeMateConnectionView }) {
  return (
    <details className={styles.moderationControls}>
      <summary>Melden oder blockieren</summary>
      <div>
        <form action={reportChallengeMateAction}>
          <input type="hidden" name="mateUserId" value={entry.mateUserId} />
          <label>
            Meldegrund für {entry.mateName}
            <select name="reason" defaultValue="spam">
              <option value="spam">Spam</option>
              <option value="inappropriate">Unangemessenes Verhalten</option>
              <option value="safety">Bedrohliches Verhalten</option>
              <option value="other">Anderer Grund</option>
            </select>
          </label>
          <label>
            Details – optional
            <textarea name="details" maxLength={250} />
          </label>
          <button type="submit" className={styles.textButton} aria-label={`${entry.mateName} melden`}>Melden</button>
        </form>
        <form action={blockChallengeMateAction} className={styles.blockForm}>
          <input type="hidden" name="mateUserId" value={entry.mateUserId} />
          <label className={styles.confirmBlock}>
            <input type="checkbox" name="confirmBlock" value="yes" required />
            {entry.mateName} wirklich blockieren
          </label>
          <button type="submit" className={styles.dangerButton} aria-label={`${entry.mateName} blockieren`}>Blockieren</button>
        </form>
      </div>
    </details>
  );
}

function MateCardBody({
  name,
  goal,
  challengeTitle,
  mode,
  location,
  availableFrom,
  availableUntil
}: {
  name: string;
  goal: string;
  challengeTitle: string;
  mode: "remote" | "local";
  location: string | null;
  availableFrom?: string;
  availableUntil?: string;
}) {
  return (
    <div className={styles.cardBody}>
      <p className={styles.cardMeta}>{challengeTitle}</p>
      <h3>{name}</h3>
      <p>{goal}</p>
      <dl>
        <div><dt>Modell</dt><dd>{mode === "remote" ? "Remote" : location}</dd></div>
        {availableFrom && availableUntil ? (
          <div><dt>Zeitraum</dt><dd>{formatDate(availableFrom)}–{formatDate(availableUntil)}</dd></div>
        ) : null}
      </dl>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(`${value}T00:00:00.000Z`));
}
