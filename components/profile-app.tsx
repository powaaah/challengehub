"use client";

import { useActionState } from "react";
import type { ProfileFormState } from "@/app/profil/actions";
import type { CurrentUser } from "@/lib/auth";
import { SiteFooter, SiteHeader } from "./site-shell";
import styles from "./profile-app.module.css";

const initialState: ProfileFormState = { error: "", success: "" };

type ProfileAppProps = {
  user: CurrentUser;
  updateProfile: (state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>;
};

export function ProfileApp({ user, updateProfile }: ProfileAppProps) {
  const [state, action, pending] = useActionState(updateProfile, initialState);

  return (
    <>
      <SiteHeader user={user} />
      <main id="main-content" tabIndex={-1} className={styles.page}>
        <section className={styles.heading}>
          <p>Kontoeinstellungen</p>
          <h1>Dein Profil</h1>
          <span>Verwalte, wie du bei ChallengeHub sichtbar bist und dich anmeldest.</span>
        </section>

        <section className={styles.card} aria-labelledby="username-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Öffentlich sichtbar</p>
              <h2 id="username-heading">Benutzername</h2>
            </div>
            <span>2–30 Zeichen</span>
          </div>

          <form action={action} className={styles.form}>
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
            {state.error && <p className={styles.error} role="alert">{state.error}</p>}
            {state.success && <p className={styles.success} role="status">{state.success}</p>}
            <button type="submit" disabled={pending}>
              {pending ? "Speichert…" : "Benutzername speichern"}
            </button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="email-heading">
          <div className={styles.cardHeading}>
            <div>
              <p>Kontozugang</p>
              <h2 id="email-heading">E-Mail-Adresse</h2>
            </div>
            <span>Nicht öffentlich</span>
          </div>
          <div className={styles.readonlyField}>
            <span>E-Mail-Adresse</span>
            <strong>{user.email}</strong>
          </div>
          <p className={styles.hint}>Die Änderung der E-Mail-Adresse folgt in einem separaten, verifizierten Sicherheits-Slice.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
