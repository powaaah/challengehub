"use client";

import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/auth/actions";
import styles from "@/app/auth/page.module.css";

const initialState = {
  error: ""
};

export function AuthForms({ next }: { next: string }) {
  const [registerState, registerFormAction, registerPending] = useActionState(registerAction, initialState);
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialState);

  return (
    <section className={styles.forms} aria-label="Login und Registrierung">
      <form className={styles.form} action={registerFormAction}>
        <input type="hidden" name="next" value={next} />
        <p className={styles.kicker}>Neu hier</p>
        <h2>Registrieren</h2>
        {registerState.error && <p className={styles.error}>{registerState.error}</p>}
        <label>
          Name
          <input name="name" autoComplete="name" required minLength={2} />
        </label>
        <label>
          E-Mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Passwort
          <input name="password" type="password" autoComplete="new-password" required minLength={8} />
        </label>
        <button type="submit" disabled={registerPending}>
          {registerPending ? "Wird erstellt..." : "Account erstellen"}
        </button>
      </form>

      <form className={styles.form} action={loginFormAction}>
        <input type="hidden" name="next" value={next} />
        <p className={styles.kicker}>Schon dabei</p>
        <h2>Login</h2>
        {loginState.error && <p className={styles.error}>{loginState.error}</p>}
        <label>
          E-Mail
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Passwort
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        <button type="submit" disabled={loginPending}>
          {loginPending ? "Loggt ein..." : "Einloggen"}
        </button>
      </form>
    </section>
  );
}
