"use client";

import { useActionState } from "react";
import type {
  DeleteAccountState,
  EmailVerificationFormState,
  PrivacyFormState,
  ProfileFormState
} from "@/app/profil/actions";
import type { AccountPrivacyPreferences } from "@/domain/accounts/account-data-repository";
import type { CurrentUser } from "@/lib/auth";
import { SiteFooter, SiteHeader } from "./site-shell";
import styles from "./profile-app.module.css";

const initialState = { error: "", success: "" };

type ProfileAppProps = {
  user: CurrentUser;
  privacy: AccountPrivacyPreferences;
  updateProfile: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
  resendEmailVerification: (state: EmailVerificationFormState, formData: FormData) => Promise<EmailVerificationFormState>;
  updatePrivacy: (state: PrivacyFormState, formData: FormData) => Promise<PrivacyFormState>;
  deleteAccount: (state: DeleteAccountState, formData: FormData) => Promise<DeleteAccountState>;
};

export function ProfileApp({
  user,
  privacy,
  updateProfile,
  resendEmailVerification,
  updatePrivacy,
  deleteAccount
}: ProfileAppProps) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, initialState);
  const [verificationState, verificationAction, verificationPending] = useActionState(
    resendEmailVerification,
    initialState
  );
  const [privacyState, privacyAction, privacyPending] = useActionState(updatePrivacy, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccount, initialState);

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.heading}>
          <p>Kontoeinstellungen</p>
          <h1>Dein Profil</h1>
          <span>Bestimme selbst, welche Aktivitäten öffentlich sichtbar sind und was mit deinen Daten passiert.</span>
        </section>

        <section className={styles.card} aria-labelledby="username-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Öffentlich sichtbar</p>
              <h2 id="username-heading">Benutzername</h2>
            </div>
            <span>2–30 Zeichen</span>
          </div>

          <form action={profileAction} className={styles.form}>
            <label htmlFor="profile-name">Benutzername</label>
            <input
              id="profile-name"
              name="name"
              defaultValue={user.name}
              minLength={2}
              maxLength={30}
              autoComplete="username"
              required
            />
            <p className={styles.hint}>Dein Benutzername ist eindeutig und kann auch für den Login verwendet werden.</p>
            {profileState.error && <p className={styles.error} role="alert">{profileState.error}</p>}
            {profileState.success && <p className={styles.success} role="status">{profileState.success}</p>}
            <button type="submit" disabled={profilePending}>
              {profilePending ? "Speichert…" : "Benutzername speichern"}
            </button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="email-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Kontozugang</p>
              <h2 id="email-heading">E-Mail-Adresse</h2>
            </div>
            <span>{user.emailVerifiedAt ? "Bestätigt" : "Noch nicht bestätigt"}</span>
          </div>
          <div className={styles.readonlyField}>
            <span>E-Mail-Adresse</span>
            <strong>{user.email}</strong>
          </div>
          {!user.emailVerifiedAt ? (
            <form action={verificationAction} className={styles.inlineForm}>
              <p className={styles.hint}>Bestätige deine Adresse über den Link in deiner E-Mail.</p>
              {verificationState.success && <p className={styles.success} role="status">{verificationState.success}</p>}
              <button type="submit" disabled={verificationPending}>
                {verificationPending ? "Sendet…" : "Bestätigungslink erneut senden"}
              </button>
            </form>
          ) : (
            <p className={styles.success}>Deine E-Mail-Adresse ist bestätigt.</p>
          )}
        </section>

        <section className={styles.card} aria-labelledby="privacy-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Standardmäßig privat</p>
              <h2 id="privacy-heading">Öffentliche Sichtbarkeit</h2>
            </div>
            <span>Du entscheidest</span>
          </div>
          <form action={privacyAction} className={styles.form}>
            <label className={styles.option}>
              <input type="checkbox" name="rankingVisible" defaultChecked={privacy.rankingVisible} />
              <span><strong>Im öffentlichen Ranking anzeigen</strong><small>Dein Benutzername und Fortschritt dürfen auf öffentlichen Challenge-Seiten erscheinen.</small></span>
            </label>
            <label className={styles.option}>
              <input type="checkbox" name="activityVisible" defaultChecked={privacy.activityVisible} />
              <span><strong>Check-ins im öffentlichen Aktivitätsfeed anzeigen</strong><small>Dein Benutzername und deine Check-in-Aktivität werden öffentlich sichtbar.</small></span>
            </label>
            <label className={styles.option}>
              <input type="checkbox" name="challengeMateDiscoverable" defaultChecked={privacy.challengeMateDiscoverable} />
              <span><strong>Für ChallengeMate-Vorschläge auffindbar</strong><small>Andere passende Teilnehmende können dich als Vorschlag sehen.</small></span>
            </label>
            {privacyState.error && <p className={styles.error} role="alert">{privacyState.error}</p>}
            {privacyState.success && <p className={styles.success} role="status">{privacyState.success}</p>}
            <button type="submit" disabled={privacyPending}>
              {privacyPending ? "Speichert…" : "Privatsphäre speichern"}
            </button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="export-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Maschinenlesbar</p>
              <h2 id="export-heading">Deine Daten exportieren</h2>
            </div>
            <span>JSON</span>
          </div>
          <p className={styles.hint}>Lade die zu deinem Konto gespeicherten Profil-, Challenge-, Teilnahme- und Aktivitätsdaten direkt herunter.</p>
          <a className={styles.primaryLink} href="/profil/export" download>Datenexport herunterladen</a>
        </section>

        <section className={`${styles.card} ${styles.dangerCard}`} aria-labelledby="delete-heading">
          <details>
            <summary id="delete-heading">Konto endgültig löschen</summary>
            <div className={styles.dangerContent}>
              <p>Dadurch werden dein Konto, deine Teilnahmen, Check-ins, Einladungen, ChallengeMate- und Erinnerungsdaten dauerhaft entfernt.</p>
              <p>Bereits veröffentlichte Challenges bleiben ohne Verknüpfung zu deinem Konto bestehen, damit laufende Teilnahmen anderer Mitglieder erhalten bleiben. Entwürfe werden gelöscht.</p>
              <form action={deleteAction} className={styles.form}>
                <label className={styles.option}>
                  <input type="checkbox" name="confirmation" required />
                  <span><strong>Ich habe die Folgen verstanden</strong></span>
                </label>
                <label htmlFor="delete-password">Aktuelles Passwort zur Kontolöschung</label>
                <input id="delete-password" name="password" type="password" autoComplete="current-password" required />
                {deleteState.error && <p className={styles.error} role="alert">{deleteState.error}</p>}
                <button className={styles.dangerButton} type="submit" disabled={deletePending}>
                  {deletePending ? "Löscht…" : "Konto jetzt löschen"}
                </button>
              </form>
            </div>
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
