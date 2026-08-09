"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  resetPasswordAction,
  type PasswordResetState
} from "@/app/auth/passwort-zuruecksetzen/actions";
import { INPUT_LIMITS } from "@/domain/security/input-limits";
import styles from "@/app/auth/password-reset.module.css";

const initialState: PasswordResetState = { error: "", success: false };

export function PasswordResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialState);

  if (state.success) {
    return (
      <div className={styles.successPanel}>
        <p>Dein Passwort wurde geändert. Alle bisherigen Sitzungen wurden beendet.</p>
        <Link className={styles.primaryLink} href="/">Jetzt anmelden</Link>
      </div>
    );
  }

  return (
    <form className={styles.form} action={action}>
      <input type="hidden" name="token" value={token} />
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      <label>
        <span>Neues Passwort</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={INPUT_LIMITS.passwordBytes}
          required
        />
      </label>
      <label>
        <span>Neues Passwort wiederholen</span>
        <input
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={INPUT_LIMITS.passwordBytes}
          required
        />
      </label>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Wird gespeichert…" : "Passwort speichern"}</button>;
}
