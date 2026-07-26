"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestPasswordResetAction,
  type PasswordResetRequestState
} from "@/app/auth/passwort-vergessen/actions";
import styles from "@/app/auth/password-reset.module.css";

const initialState: PasswordResetRequestState = { error: "", message: "" };

export function PasswordResetRequestForm() {
  const [state, action] = useActionState(requestPasswordResetAction, initialState);

  return (
    <>
      <form className={styles.form} action={action}>
        {state.error ? <p className={styles.error}>{state.error}</p> : null}
        {state.message ? <p className={styles.success}>{state.message}</p> : null}
        <label>
          <span>E-Mail-Adresse</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <SubmitButton label="Reset-Link anfordern" pendingLabel="Wird angefordert..." />
      </form>
      <Link className={styles.backLink} href="/">Zurück zur Anmeldung</Link>
    </>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? pendingLabel : label}</button>;
}
